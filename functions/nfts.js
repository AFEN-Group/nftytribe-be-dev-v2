const Moralis = require("./Moralis.sdk");
const db = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");
const { linkPhysicalItems } = require("./physicalItems");
const Uploads = require("./uploads");
const { redis } = require("@helpers/redis");
const Users = require("./users");
const { default: axios } = require("axios");

class Nfts {
  getNfts = async (options, walletAddress) => {
    const { limit, page: cursor, chain } = options;

    //validations will be re done on chains
    // const { symbol } = await db.chains.findOne({ where: { id: chain } });

    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      limit,
      cursor,
      chain,
      address: walletAddress,
    });

    const results = nfts.toJSON();
    // console.log(results);
    const listed = await db.nfts.findAll({
      where: {
        tokenId: results.result.map((data) => Number(data.token_id)),
        moreInfo: {
          contractAddress: {
            [Op.in]: results.result.map((data) => data.token_address),
          },
        },
      },
    });
    // console.log(results);
    return {
      ...nfts.pagination,
      result:
        results.result?.map((data) => {
          return {
            ...data,
            metadata: data.metadata ? JSON.parse(data.metadata) : {},
            isListed:
              listed
                .map((data) => data.tokenId)
                .includes(Number(data.token_id)) &&
              listed
                .map((data) => data.moreInfo.contractAddress)
                .includes(data.token_address)
                ? true
                : false,
          };
        }) || results,
    };
  };

  getSingleNft = async (id) => {
    const nft = await db.nfts.findOne({ where: { id } });
    return nft;
  };

  getFields = (params = []) => {
    const data = {};
    while (params.length > Object.keys(data).length) {
      const index = Object.keys(data).length;
      data[params[index].name.replace("_", "")] = params[index].value;
    }
    return data;
  };

  putOnSale = async (params = [], walletAddress, chain) => {
    //const validate chain, collection and userId

    let [user, chainId] = await Promise.all([
      await db.users.findOne({ where: { walletAddress } }),
      await db.chains.findOne({
        where: {
          chain,
        },
      }),
    ]);
    if (!user) {
      user = await new Users().createAccount({ walletAddress });
    }
    if (chainId) {
      const data = this.getFields(params);
      console.log(data);
      const collection = await db.collections.findOne({
        where: {
          contractAddress: data.erc721,
        },
      });
      const [nftMetadata, tokenData] = await Promise.all([
        await this.getNftMetaData(data.tokenId, data.erc721, chain),
        await this.getTokenData(data.erc20Token, chain),
      ]);
      /**
       * @type {string}
       */
      const file =
        nftMetadata.metadata?.image ||
        nftMetadata.metadata?.file ||
        nftMetadata.metadata?.video;
      const split = file.split(".");
      const ext = split[split.length - 1];
      const fileBuffer = await axios({
        url: file.replace("ipfs://", "https://ipfs.moralis.io:2053/ipfs/"),
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(fileBuffer.data, "binary");
      const url = await new Uploads().upload(buffer, "listing", ext);
      console.log(url);
      // building data
      const values = {
        name: nftMetadata.name,
        tokenId: data.tokenId,
        description: nftMetadata.metadata?.description,
        categoryId: Number(data.category) || undefined,
        url,
        price: data.startPrice / 10 ** tokenData.decimals,
        listingType: data.auctionType === "1" ? "NORMAL" : "AUCTION",
        timeout: moment.unix(data.endTime),
        moreInfo: {
          erc20TokenAddress: data.erc20Token,
          erc20TokenName: tokenData.name,
          erc20TokenSymbol: tokenData.symbol,
          erc20TokenDecimals: tokenData.decimals,
          nftContractType: nftMetadata.contractType,
          symbol: nftMetadata.symbol,
          contractAddress: nftMetadata.tokenAddress,
        },
        collectionId: collection?.id,
        chainId: chainId.id,
        userId: user.id,
        confirmed: true,
      };

      // store to db
      console.log(values);
      const newListing = await db.nfts.create(values);

      //check for physical item
      if (data.physical?.trim() !== "") {
        await linkPhysicalItems(data.physical, newListing.id);
      }

      return newListing;
    } else {
      //do nothing
    }
  };

  getNftMetaData = async (tokenId, address, chain) => {
    const nftMetadata = await Moralis.EvmApi.nft.getNFTMetadata({
      address,
      chain,
      tokenId,
    });
    const result = nftMetadata?.result.toJSON();
    const listing = await db.nfts.findOne({
      where: {
        tokenId,
        moreInfo: {
          contractAddress: address,
        },
      },
    });
    // console.log(nftMetadata);
    // console.log(result);
    if (result) {
      return { ...result, isListed: listing ? true : false };
    } else {
      throw {
        status: 404,
        message: "nft not found",
      };
    }
  };

  getTokenData = async (address, chain) => {
    const data = await Moralis.EvmApi.token.getTokenMetadata({
      addresses: [address],
      chain,
    });

    const result = data;
    return result?.toJSON()[0];
  };

  putOffSale = async (contractAddress, walletAddress, tokenId) => {
    const user = await db.users.findOne({
      where: {
        walletAddress,
      },
    });
    return (
      user &&
      (await db.nfts.destroy({
        where: {
          userId: user.id,
          tokenId,
          moreInfo: {
            contractAddress,
          },
        },
      }))
    );
  };

  getListings = async (inputs = {}) => {
    const {
      userId, // current user making requests
      lazyMint,
      owner,
      category,
      collection,
      chain,
      search, // search by name, collection address and symbol
      priceLowest,
      priceHighest,
      listingType,
      fromDate,
      toDate,
      limit,
      page,
      order,
      direction,
      physical,
      hasCollection,
    } = inputs;
    console.log(userId);
    const getOrder = () => {
      const orderArr = [];
      switch (order) {
        case "price":
          orderArr[0] = "price";
          break;
        case "date":
          orderArr[0] = "createdAt";
          break;
        case "name":
          orderArr[0] = "name";
          break;
        default:
          orderArr[0] = "createdAt";
          break;
      }

      orderArr[1] = direction.toLowerCase() === "asc" ? "ASC" : "DESC";

      return orderArr;
    };

    const offset = (page - 1) * limit;

    // building out options for query
    const options = {
      ...(hasCollection !== undefined && {
        ...(hasCollection
          ? {
              collectionId: {
                [Op.not]: null,
              },
            }
          : {
              collectionId: null,
            }),
      }),
      ...(lazyMint !== undefined && {
        lazyMint: lazyMint,
      }),
      ...(physical !== undefined && {
        physical,
      }),
      ...(owner && {
        [Op.and]: {
          [Op.or]: [
            {
              userId: owner,
            },
            {
              "moreInfo.contractAddress": owner,
            },
          ],
        },
      }),
      ...(category && {
        categoryId: category,
      }),
      ...(collection && {
        collectionId: collection,
      }),
      ...(chain && {
        chainId: chain,
      }),
      ...(search && {
        [Op.and]: {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              moreInfo: {
                symbol: {
                  [Op.like]: `%${search}%`,
                },
              },
            },
            {
              moreInfo: {
                contractAddress: {
                  [Op.like]: `%${search}%`,
                },
              },
            },
          ],
        },
      }),
      ...((priceHighest || priceLowest) && {
        price: {
          [Op.and]: {
            ...(priceLowest && {
              [Op.gte]: priceLowest,
            }),
            ...(priceHighest && {
              [Op.lte]: priceHighest,
            }),
          },
        },
      }),
      ...(listingType && {
        listingType,
      }),
      ...((fromDate || toDate) && {
        createdAt: {
          [Op.and]: {
            ...(fromDate && {
              [Op.gte]: fromDate,
            }),
            ...(toDate && {
              [Op.lte]: toDate,
            }),
          },
        },
      }),
      [Op.or]: [
        {
          timeout: null,
        },
        {
          timeout: {
            [Op.gt]: new Date(),
          },
        },
      ],
      ...(!owner &&
        userId && {
          // do not get users own listings
          userId: {
            [Op.ne]: userId,
          },
        }),
    };

    // console.log(inputs);
    const count = await db.nfts.count({
      where: options,
    });

    const includeOptions = [
      {
        model: db.users,
        attributes: [
          "username",
          "email",
          "walletAddress",
          "verified",
          "twitter",
        ],
        include: [
          {
            model: db.avatar,
          },
        ],
      },
      {
        model: db.nftLikes,
        attributes: [],
      },
      {
        model: db.nftFavorites,
        attributes: [],
      },
      {
        model: db.listingWatchers,
        attributes: [],
      },
      {
        model: db.users,
        attributes: ["username", "walletAddress", "id"],
        include: {
          model: db.avatar,
          attributes: ["url"],
        },
      },
    ];
    const totalPages = Math.ceil(count / limit);

    const result = await db.nfts.findAll({
      where: options,
      nest: true,
      include: includeOptions,
      subQuery: false,
      // raw: true,
      attributes: {
        include: [
          [
            db.Sequelize.literal(
              "(select count(*) from nftLikes where id = nftLikes.id)"
            ),
            "likeCount",
          ],
          [
            db.Sequelize.literal(
              "(select count(*) from nftFavorites where id = nftFavorites.id)"
            ),
            "favoriteCount",
          ],
          [
            db.Sequelize.literal(
              "(select count(*) from listingWatchers where id = listingWatchers.id)"
            ),
            "watchCount",
          ],
          userId && [
            db.Sequelize.literal(
              `
              (
                SELECT IF(
                  (SELECT id FROM nftLikes WHERE userId = ${userId} AND nftId = nfts.id) IS NOT NULL,
                  TRUE,
                  FALSE
                )
              )
              `
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.literal(
              `
              (
                SELECT IF(
                  (SELECT id FROM nftFavorites WHERE userId = ${userId} AND nftId = nfts.id) IS NOT NULL,
                  TRUE,
                  FALSE
                )
              )
              `
            ),
            "isFavorite",
          ],
          userId && [
            db.Sequelize.literal(
              `
              (
                SELECT IF(
                  (SELECT id FROM listingWatchers WHERE userId = ${userId} AND nftId = nfts.id) IS NOT NULL,
                  TRUE,
                  FALSE
                )
              )
              `
            ),
            "isWatched",
          ],
        ].filter((data) => data && data),
      },
      limit,
      offset,
      group: [
        "nfts.id",
        "user.id",
        "nftLikes.id",
        "nftFavorites.id",
        "listingWatchers.id",
      ],
      order: [getOrder()],
    });

    // console.log(result[0].toJSON());

    return [...result].map((data) => {
      const listing = data.toJSON();
      return {
        ...listing,
        isLiked: listing.isLiked ? true : false,
        isFavorite: listing.isFavorite ? true : false,
        isWatched: listing.isWatched ? true : false,
      };
    });
  };

  likeUnlike = async (userId, nftId) => {
    const isLiked = await db.nftLikes.findOne({
      where: {
        userId,
        nftId,
      },
    });
    if (isLiked) {
      await db.nftLikes.destroy({
        where: {
          userId,
          nftId,
        },
      });
      return {
        status: false,
        id: nftId,
      };
    } else {
      await db.nftLikes.create({
        userId,
        nftId,
      });

      return {
        status: true,
        id: nftId,
      };
    }
  };

  favoriteUnfavorite = async (userId, nftId) => {
    const isFavorite = await db.nftFavorites.findOne({
      where: {
        userId,
        nftId,
      },
    });
    if (isFavorite) {
      await db.nftFavorites.destroy({
        where: {
          userId,
          nftId,
        },
      });
      return {
        status: false,
        id: nftId,
      };
    } else {
      await db.nftFavorites.create({
        userId,
        nftId,
      });

      return {
        status: true,
        id: nftId,
      };
    }
  };

  getSingleListing = async (id, userId) => {
    const result = await db.nfts.findOne({
      // subQuery: false,
      where: {
        id,
      },
      attributes: {
        include: [
          [
            db.Sequelize.literal(
              "(select count(*) from nftLikes where id = nftLikes.id)"
            ),
            "likeCount",
          ],
          [
            db.Sequelize.literal(
              "(select count(*) from nftFavorites where id = nftFavorites.id)"
            ),
            "favoriteCount",
          ],
          [
            db.Sequelize.literal(
              "(select count(*) from listingWatchers where id = listingWatchers.id)"
            ),
            "watchCount",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `
                ( select id from nftLikes where userId = ${userId} and nftId = nfts.id )
              `
              ),
              "boolean"
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `
                ( select id from nftFavorites where userId = ${userId} and nftId = nfts.id )
              `
              ),
              "boolean"
            ),
            "isFavorite",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `
                ( select id from listingWatchers where userId = ${userId} and nftId = nfts.id )
              `
              ),
              "boolean"
            ),
            "isWatched",
          ],
        ].filter((data) => data && data),
      },
      include: [
        {
          model: db.users,
          attributes: [
            "username",
            "email",
            "walletAddress",
            "verified",
            "twitter",
          ],
          include: [
            {
              model: db.avatar,
            },
          ],
        },
        {
          model: db.nftLikes,
          attributes: [],
        },
        {
          model: db.nftFavorites,
          attributes: [],
        },
        {
          model: db.listingWatchers,
          attributes: [],
        },
      ],
      group: [
        "nfts.id",
        "nftLikes.id",
        "nftFavorites.id",
        "listingWatchers.id",
      ],
    });
    if (!result)
      throw {
        message: "Listing not found!",
        status: 404,
      };
    const listing = result.toJSON();
    return {
      ...listing,
      isLiked: listing.isLiked ? true : false,
      isFavorite: listing.isFavorite ? true : false,
      isWatched: listing.isWatched ? true : false,
    };
  };

  newBid = async (params = [], walletAddress) => {
    const data = this.getFields(params);
    const listing = await db.nfts.findOne({
      where: {
        tokenId: data.tokenId,
        moreInfo: {
          contractAddress: data.erc721,
        },
      },
    });
    const bidder = await db.users.findOne({
      where: {
        walletAddress,
      },
    });

    if (listing && bidder) {
      const bid = await db.bids.create({
        nftId: listing.id,
        userId: bidder.id,
        amount: data.amount / 10 ** listing.moreInfo.erc20TokenDecimals,
      });
      return bid;
    }
  };

  getBids = async (id, params = {}) => {
    const { page, limit } = params;
    const options = {
      nftId: id,
    };
    const total = await db.bids.count({
      where: options,
    });

    const offset = (page - 1) * limit;

    const bids = await db.bids.findAll({
      where: options,
      include: [
        {
          model: db.users,
        },
      ],
      limit,
      offset,
    });

    return {
      page,
      total,
      totalPages: Math.ceil(total / limit),
      results: bids,
    };
  };

  watchListing = async (nftId, userId) => {
    const isWatching = await db.listingWatchers.findOne({
      where: {
        userId,
        nftId,
      },
    });
    if (isWatching) {
      await db.listingWatchers.destroy({
        where: {
          nftId,
          userId,
        },
      });

      return {
        id: isWatching.id,
        status: false,
      };
    } else {
      const res = await db.listingWatchers.create({
        nftId,
        userId,
      });
      return {
        ...res.dataValues,
        status: true,
      };
    }
  };

  getWatchers = async (nftId, options = {}) => {
    const { page, limit } = options;
    const total = await db.listingWatchers.count({ where: { nftId } });
    const offset = (page - 1) * limit;
    const res = await db.listingWatchers.findAll({
      where: {
        nftId,
      },
      limit,
      offset,
    });
    return {
      results: res,
      page,
      total,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  buyNft = async (params = [], from) => {
    //verify and remove listing
    console.log(params); //testing purposes
    const data = this.getFields(params);

    const { tokenId, erc721 } = data;

    let buyer = await db.users.findOne({
      where: {
        walletAddress: from,
      },
    });

    if (!buyer) {
      buyer = await new Users().createAccount({ walletAddress: from });
    }

    const listing = await db.nfts.findOne({
      where: {
        tokenId,
        "moreInfo.contractAddress": erc721,
      },
      include: {
        model: db.chains,
      },
    });
    if (listing) {
      //create transaction
      //use sequelize transaction on this section later
      let tokenPrice;
      try {
        tokenPrice = await Moralis.EvmApi.token.getTokenPrice({
          address: listing.moreInfo.erc20TokenAddress,
          chain: listing.chain.chain,
        });
      } catch (err) {
        console.log(err);
      }

      const newTransaction = await db.transactions.create({
        amount: listing.amount,
        price: listing.price,
        collectionId: listing.collectionId,
        chainId: listing.chainId,
        erc20Info: {
          address: listing.moreInfo.erc20TokenAddress,
          name: listing.moreInfo.erc20TokenName,
          symbol: listing.moreInfo.erc20TokenSymbol,
          decimals: listing.moreInfo.erc20TokenDecimals,
        },
        nftInfo: {
          type: listing.moreInfo.nftContractType,
          symbol: listing.moreInfo.symbol,
          address: listing.moreInfo.contractAddress,
        },
        listingInfo: {
          name: listing.name,
          tokenId: listing.tokenId,
          description: listing.description,
          categoryId: listing.categoryId,
          url: listing.url,
          listingType: listing.listingType,
          timeout: listing.timeout,
          physical: listing.physical,
          lazyMint: listing.lazyMint,
          createdAt: listing.createdAt,
          usd: tokenPrice?.toJSON().usdPrice * listing.price || 0,
          nativePrice: tokenPrice?.toJSON()?.nativePrice
            ? {
                ...tokenPrice?.toJSON().nativePrice,
                value:
                  (tokenPrice?.toJSON().nativePrice.value /
                    tokenPrice?.toJSON().nativePrice.decimals) *
                  listing.price,
              }
            : {
                //dummy data and will be removed soon
                name: "Binance Coin",
                value: "3824552021216254",
                symbol: "BNB",
                decimals: 18,
              },
        },
        buyerId: buyer.id,
        sellerId: listing.userId,
      });

      await db.nfts.destroy({
        where: { id: listing.id },
      });
      return newTransaction;
    }
  };

  getSold = async (data = {}, userId) => {
    const { limit, page } = data;
    const offset = (page - 1) * limit;
    const options = {
      sellerId: userId,
    };
    const attributes = ["id", "username", "email", "walletAddress"];
    const totalSold = await db.transactions.count({
      where: options,
    });
    const sold = await db.transactions.findAll({
      where: options,
      limit,
      offset,
      include: [
        {
          model: db.users,
          as: "seller",
          attributes,
        },
        {
          model: db.users,
          as: "buyer",
          attributes,
        },
      ],
      order: [["id", "desc"]],
    });
    return {
      page,
      totalCount: totalSold,
      totalPages: Math.ceil(totalSold / limit),
      limit,
      results: sold,
    };
  };
  getCollected = async (data = {}, userId) => {
    const { limit, page } = data;
    const offset = (page - 1) * limit;

    const options = {
      buyerId: userId,
    };

    const totalCollected = await db.transactions.count({
      where: options,
    });
    const attributes = ["id", "username", "email", "walletAddress"];
    const collected = await db.transactions.findAll({
      where: options,
      limit,
      offset,
      include: [
        {
          model: db.users,
          as: "seller",
          attributes,
        },
        {
          model: db.users,
          as: "buyer",
          attributes,
        },
      ],
      order: [["id", "desc"]],
    });

    return {
      page,
      totalCount: totalCollected,
      totalPages: Math.ceil(totalCollected / limit),
      limit,
      results: collected,
    };
  };

  static createNft = async (data = {}, image, username) => {
    const upload = await Uploads.uploadFileToIpfs(
      image.base64,
      image.mime,
      username
    );

    //include data
    data.date = moment().unix();
    const [uriData] = upload;

    //get ipfs alone
    let uri = "ipfs://";
    uri += uriData.path.split("/ipfs/")[1];
    const jsonFileUpload = await Uploads.uploadFileToIpfs(
      {
        name: data.name,
        description: data.description,
        image: uri,
        website: data.website || "",
        date: data.date,
      },
      "json",
      username
    );
    const [jsonUri] = jsonFileUpload;

    if (data.lazyMint) {
      //handle listing the item automatically
    }

    return {
      path: jsonUri.path,
      uri: "ipfs://" + jsonUri.path.split("/ipfs/")[1],
    };
  };
}

module.exports = Nfts;

// const testParamsBuy = [
//   { name: "_tokenId", value: "26", type: "uint256" },
//   {
//     name: "_erc721",
//     value: "0xc5d8cb7b9aafee5c5bdbfabbf46b4153874646f4",
//     type: "address",
//   },
// ];

// new Nfts()
//   .buyNft(testParamsBuy, "0x9dE3eBed16423B3A6BecDd77823485d44F5A7b8B")
//   .then((done) => {
//     console.log(done);
//   });

// const dummyData = {
//   url: "ipfs://QmYkmN4kX4C79H4rQvWYHNhSw8kUCGEEsqjEHWkJRtvht6/26.png",
//   usd: 1.0001821141448397,
//   name: "TheSe7enContinents",
//   timeout: "2023-02-03T17:06:02.000Z",
//   tokenId: 26,
//   categoryId: null,
//   description: "Jungle Arts of Fantom Kaolas",
//   listingType: "NORMAL",
//   nativePrice: {
//     name: "Binance Coin",
//     value: "3824552021216254",
//     symbol: "BNB",
//     decimals: 18,
//   },
// };

// let testUrl =
//   "https://ipfs.moralis.io:2053/ipfs/QmYkmN4kX4C79H4rQvWYHNhSw8kUCGEEsqjEHWkJRtvht6/24.png";

// axios({
//   url: testUrl,
//   responseType: "arraybuffer",
//   method: "get",
// })
//   .then(async (response) => {
//     console.log(response.data);
//     const buffer = Buffer.from(response.data, "binary");
//     const url = await new Uploads().upload(buffer, "listing", "jpeg");
//     console.log(url);
//   })
//   .catch((err) => console.log(err));

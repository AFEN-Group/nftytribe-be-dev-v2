const Moralis = require("./Moralis.sdk");
const db = require("../models");
const { Op } = require("sequelize");

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
    return {
      ...nfts.pagination,
      result:
        results.result?.map((data) => {
          return {
            ...data,
            metadata: data.metadata ? JSON.parse(data.metadata) : {},
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

    const [user, chainId] = await Promise.all([
      await db.users.findOne({ where: { walletAddress } }),
      await db.chains.findOne({
        where: {
          chain,
        },
      }),
    ]);

    if (chainId && user) {
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

      // console.log(tokenData);

      // building data
      const values = {
        name: nftMetadata.name,
        tokenId: data.tokenId,
        description: nftMetadata.metadata?.description,
        categoryId: Number(data.category) || undefined,
        url:
          nftMetadata.metadata?.image ||
          nftMetadata.metadata?.file ||
          nftMetadata.metadata?.video,
        price: data.startPrice,
        listingType: data.auctionType === "1" ? "NORMAL" : "AUCTION",
        timeout: new Date(Date.now() + data.endTime * 1000),
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
    const result = nftMetadata.result.toJSON();
    // console.log(nftMetadata);
    // console.log(result);
    return result;
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
        [Op.or]: [
          {
            userId: owner,
          },
        ],
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
    };

    console.log(inputs);
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
      include: includeOptions,
      subQuery: false,
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
            db.Sequelize.where(
              db.Sequelize.col("nftLikes.userId"),
              Op.eq,
              userId
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.where(
              db.Sequelize.col("nftFavorites.userId"),
              Op.eq,
              userId
            ),
            "isFavorite",
          ],
          userId && [
            db.Sequelize.where(
              db.Sequelize.col("listingWatchers.userId"),
              Op.eq,
              userId
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
    console.log(result);
    return {
      page,
      totalPages,
      limit,
      results: [...result].map((data) => {
        const value = { ...data.dataValues };
        value.isLiked = value.isLiked ? true : false;
        value.isFavorite = value.isFavorite ? true : false;
        value.isWatched = value.isWatched ? true : false;
        return value;
      }),
    };
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
        status: "unliked",
        id: nftId,
      };
    } else {
      await db.nftLikes.create({
        userId,
        nftId,
      });

      return {
        status: "liked",
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
        status: "unFavorite",
        id: nftId,
      };
    } else {
      await db.nftFavorites.create({
        userId,
        nftId,
      });

      return {
        status: "favorite",
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
            db.Sequelize.where(
              db.Sequelize.col("nftLikes.userId"),
              Op.eq,
              userId
            ),

            "isLiked",
          ],
          userId && [
            db.Sequelize.where(
              db.Sequelize.col("nftFavorites.userId"),
              Op.eq,
              userId
            ),
            "isFavorite",
          ],
          userId && [
            db.Sequelize.where(
              db.Sequelize.col("listingWatchers.userId"),
              Op.eq,
              userId
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
    return {
      ...result.dataValues,
      isLiked: result.dataValues.isLiked ? true : false,
      isFavorite: result.dataValues.isFavorite ? true : false,
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
        amount: data.amount,
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
        status: "unwatched",
      };
    } else {
      const res = await db.listingWatchers.create({
        nftId,
        userId,
      });
      return {
        ...res.dataValues,
        status: "watched",
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
    const data = this.getFields(params);

    const { tokenId, erc721 } = data;

    const buyer = await db.users.findOne({
      where: {
        walletAddress: from,
      },
    });
    const listing = await db.nfts.findOne({
      where: {
        tokenId,
        "moreInfo.contractAddress": erc721,
      },
    });
    console.log(data, listing, from, tokenId, erc721);
    console.log("then this", buyer, listing);
    if (listing && buyer) {
      //create transaction
      //use sequelize transaction on this section later

      const newTransaction = await db.transactions.create({
        amount: listing.amount,
        price: listing.price,
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
          price: listing.price,
          listingType: listing.listingType,
          timeout: listing.timeout,
          chain: listing.chainId,
          collectionId: listing.collectionId,
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
}

module.exports = Nfts;

// db.nfts
//   .findOne({
//     where: {
//       tokenId: "25",
//       moreInfo: {
//         contractAddress: "0xc5d8cb7b9aafee5c5bdbfabbf46b4153874646f4",
//       },
//     },
//   })
//   .then((e) => console.log(e));

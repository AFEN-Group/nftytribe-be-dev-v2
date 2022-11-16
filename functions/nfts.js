const moralis = require("./moralis");
const Moralis = require("moralis").default;
const db = require("../models");
const { Op } = require("sequelize");

Moralis.start({
  apiKey: process.env.moralis_api_key,
});
class Nfts {
  getNfts = async (options, walletAddress) => {
    const { limit, page: cursor, chain } = options;

    //validations will be re done on chains
    // const { symbol } = await db.chains.findOne({ where: { id: chain } });
    const nfts = await moralis(`${walletAddress}/nft`, "get", {
      chain,
      limit,
      cursor,
    });
    return {
      ...nfts,
      result: nfts.result.map((data) => ({
        ...data,
        metadata: JSON.parse(data.metadata),
      })),
    };
  };
  getSingleNft = async (id) => {
    const nft = await db.nfts.findOne({ where: { id } });
    return nft;
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
      const data = {};
      while (params.length > Object.keys(data).length) {
        const index = Object.keys(data).length;
        data[params[index].name.replace("_", "")] = params[index].value;
      }
      const collection = await db.collections.findOne({
        where: {
          contractAddress: data.mintableToken,
        },
      });
      const [nftMetadata, tokenData] = await Promise.all([
        await this.getNftMetaData(data.tokenID, data.mintableToken, chain),
        await this.getTokenData(data.erc20Token, chain),
      ]);

      console.log(tokenData);

      // building data
      const values = {
        name: nftMetadata.name,
        tokenId: data.tokenID,
        description: nftMetadata.metadata?.description,
        url:
          nftMetadata.metadata?.image ||
          nftMetadata.metadata?.file ||
          nftMetadata.metadata?.video,
        price: data.auctionType === "1" ? data.buyPrice : data.startingPrice,
        listingType: data.auctionType === "1" ? "NORMAL" : "AUCTION",
        timeout:
          data.auctionType === "1"
            ? null
            : new Date(Date.now() + data.duration * 1000),
        moreInfo: {
          erc20TokenAddress: data.erc20Token,
          erc20TokenName: tokenData.token.name,
          erc20TokenSymbol: tokenData.token.symbol,
          erc20TokenDecimals: tokenData.token.decimals,
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
    return nftMetadata?.toJSON();
  };

  getTokenData = async (address, chain) => {
    const data = await Moralis.EvmApi.token.getTokenMetadata({
      addresses: [address],
      chain,
    });
    return data?.toJSON()[0];
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
      order, // recent, most viewed, oldest, most liked
    } = inputs;

    const offset = (page - 1) * limit;

    // building out options for query
    const options = {
      ...(lazyMint !== undefined && {
        lazyMint: lazyMint,
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
    };

    console.log(inputs);
    const count = await db.nfts.count({
      where: options,
    });

    const includeOptions = [
      {
        model: db.nftLikes,
        attributes: [],
      },
      {
        model: db.nftFavorites,
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
            db.Sequelize.fn("count", db.Sequelize.col("nftLikes.id")),
            "likeCount",
          ],
          [
            db.Sequelize.fn("count", db.Sequelize.col("nftFavorites.id")),
            "favoriteCount",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.where(
                db.Sequelize.col("nftLikes.userId"),
                Op.eq,
                userId
              ),
              "boolean"
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.where(
                db.Sequelize.col("nftFavorites.userId"),
                Op.eq,
                userId
              ),
              "boolean"
            ),
            "isLiked",
          ],
        ].filter((data) => data && data),
      },
      limit,
      offset,
      group: ["nfts.id", "user.id", "nftLikes.id", "nftFavorites.id"],
    });

    return {
      page,
      totalPages,
      limit,
      results: [...result].map((data) => {
        const value = { ...data.dataValues };
        value.isLiked = value.isLiked ? true : false;
        value.isFavorite = value.isFavorite ? true : false;
        return value;
      }),
    };
  };

  likeUnlike = async () => {};
  favoriteUnfavorite = async () => {};
}

module.exports = Nfts;

const { Op } = require("sequelize");
const owner = require("abi/owner");
const db = require("models");
const moralis = require("./moralis");
const Moralis = require("./Moralis.sdk");
const { Sequelize } = require("../models");
class Collections {
  constructor(userId) {
    this.userId = userId;
  }
  importCollection = async (
    contractAddress,
    chainId,
    walletAddress,
    coverImage
  ) => {
    const chain = await db.chains.findOne({ where: { chain: chainId } });

    const syncing = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        const sync = await Moralis.EvmApi.nft.syncNFTContract({
          address: contractAddress,
          chain: chainId,
        });
        return resolve(sync?.toJSON());
      }, 1000);
    });

    const result = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        const data = await Moralis.EvmApi.nft.getNFTContractMetadata({
          address: contractAddress,
          chain: chainId,
        });
        resolve(data);
      }, 500);
    });

    const metaData = result?.toJSON();
    console.log(metaData);

    const user = await db.users.findOne({
      where: { walletAddress },
      include: { model: db.avatar },
    });

    //checking ownership of collection
    const ownerAddress = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        const isOwner = await Moralis.EvmApi.utils.runContractFunction({
          abi: owner,
          address: contractAddress,
          chain: chainId,
          functionName: "owner",
        });
        resolve(isOwner?.toJSON());
        console.log(isOwner?.toJSON());
      }, 500);
    });
    if (ownerAddress.toLowerCase() !== user.walletAddress.toLowerCase())
      throw {
        status: 401,
        message: "Collection does not belong to you!",
      };

    if (user && chain) {
      const collection = await db.collections.create({
        userId: user.id,
        ...metaData,
        contractAddress,
        coverImage: coverImage || user.avatar.url,
        chainId: chain.id,
        contractType: metaData.contract_type,
      });

      return collection;
    } else {
      throw {
        message: "invalid user or chain",
        status: 400,
      };
    }
  };

  getCollectionMetaData = async (contractAddress, chain = "bsc") => {
    const options = { chain };
    const metaData = await moralis(
      `/nft/${contractAddress}/metadata`,
      "get",
      options
    );
    return metaData;
  };

  deleteCollection = async (id, userId = this.userId) => {
    await db.collections.destroy({
      where: {
        id,
        userId,
      },
    });
    return {
      message: "success",
      collectionId: id,
    };
  };
  getCollections = async (params, userId = this.userId) => {
    const { limit, page, search, liked, favorites, owner } = params;
    // console.log(liked, favorites);
    const options = {
      ...(search && {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            contractAddress: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }),
      ...(liked && {
        "$collectionLikes.userId$": userId,
      }),
      ...(favorites && {
        "$collectionFavorites.userId$": userId,
      }),
      ...(owner && {
        userId: owner,
      }),
    };
    const includeOptions = [
      {
        model: db.collectionLikes,
        attributes: [],
      },
      {
        model: db.collectionFavorites,
        attributes: [],
      },
    ];

    const count = await db.collections.count({
      where: options,
      include: includeOptions,
    });
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);

    let results = await db.collections.findAll({
      where: options,
      subQuery: false,
      attributes: {
        include: [
          [
            db.Sequelize.fn("count", db.Sequelize.col("collectionLikes.id")),
            "likeCount",
          ],
          [
            db.Sequelize.fn(
              "count",
              db.Sequelize.col("collectionFavorites.id")
            ),
            "favoriteCount",
          ],
          [
            Sequelize.literal(`(
              select sum(listingInfo->>"$.nativePrice.value") from transactions where nftInfo->>"$.address" = collections.contractAddress
            )`),
            "volume",
          ],
          [
            Sequelize.literal(`(
              select min()
            )`),
            "floorPrice",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.where(
                db.Sequelize.col("collectionLikes.userId"),
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
                db.Sequelize.col("collectionFavorites.userId"),
                userId
              ),
              "boolean"
            ),
            "isFavorite",
          ],
        ].filter((data) => data && data),
      },
      include: includeOptions,
      limit,
      offset,
      group: ["collections.id", "collectionLikes.id", "collectionFavorites.id"],
    });

    return {
      limit,
      totalPages,
      page,
      results: results.map((data) => {
        return this.formatCollectionData(data);
      }),
    };
  };
  getSingleCollection = async (field, userId = this.userId) => {
    const collection = await db.collections.findOne({
      subQuery: false,
      where: {
        [Op.or]: [
          {
            name: field,
          },
          {
            id: field,
          },
          {
            contractAddress: field,
          },
        ],
      },
      include: [
        {
          model: db.collectionLikes,
          attributes: [],
        },
        {
          model: db.collectionFavorites,
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [
            db.Sequelize.fn("count", db.Sequelize.col("collectionLikes.id")),
            "likeCount",
          ],
          [
            db.Sequelize.fn(
              "count",
              db.Sequelize.col("collectionFavorites.id")
            ),
            "favoriteCount",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.where(
                db.Sequelize.col("collectionLikes.userId"),
                userId
              ),
              "boolean"
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.where(
                db.Sequelize.col("collectionFavorites.userId"),
                userId
              ),
              "boolean"
            ),
            "isFavorite",
          ],
        ].filter((data) => data && data),
      },
      group: ["collections.id", "collectionLikes.id", "collectionFavorites.id"],
    });
    return this.formatCollectionData(collection);
  };
  likeUnlikeCollection = async (collectionId, userId = this.userId) => {
    const isLiked = await db.collectionLikes.findOne({
      where: { collectionId, userId },
    });
    if (isLiked) {
      await db.collectionLikes.destroy({
        where: {
          userId,
          collectionId,
        },
      });
      return {
        status: "unlike",
        collectionId,
      };
    } else {
      await db.collectionLikes.create({
        userId,
        collectionId,
      });
      return {
        status: "liked",
        collectionId,
      };
    }
  };
  favoriteUnfavoriteCollection = async (collectionId, userId = this.userId) => {
    const isLiked = await db.collectionFavorites.findOne({
      where: { collectionId, userId },
    });
    if (isLiked) {
      await db.collectionFavorites.destroy({
        where: {
          userId,
          collectionId,
        },
      });
      return {
        status: "removed",
        collectionId,
      };
    } else {
      await db.collectionFavorites.create({
        userId,
        collectionId,
      });
      return {
        status: "added",
        collectionId,
      };
    }
  };
  formatCollectionData = (data) => {
    return data
      ? {
          ...data.dataValues,
          isLiked: data.dataValues.isLiked ? true : false,
          isFavorite: data.dataValues.isFavorite ? true : false,
        }
      : data;
  };
}

// new Collections()
//   .importCollection(
//     "0x2f204d509852f50abb1b735c2c46231a0c9516eb",
//     "0x61",
//     "0x93dd857159351cc732be2f0a42b698f130ac7e9b"
//   )
//   .catch(console.log);
// exports.Moralis = Moralis;
module.exports = Collections;

const { Op } = require("sequelize");
const db = require("../models");
const moralis = require("./moralis");
class Collections {
  constructor(userId) {
    this.userId = userId;
  }
  importCollection = async (
    contractAddress,
    chainId,
    coverImage,
    userId = this.userId
  ) => {
    const chain = await db.chains.findOne({ where: { id: chainId } });
    const metaData = await this.getCollectionMetaData(
      contractAddress,
      chain.symbol
    );
    const user = await db.users.findOne({
      where: { id: userId },
      include: { model: db.avatar },
    });

    const collection = await db.collections.create({
      userId,
      ...metaData,
      contractAddress,
      contractType: metaData.contract_type,
      coverImage: coverImage || user.avatar.url,
      chainId,
    });

    return collection;
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
    const { limit, page, search, liked, favorites } = params;
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

module.exports = Collections;

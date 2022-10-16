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

  deleteCollection = async (contractAddress, userId = this.userId) => {
    await db.collections.destroy({
      where: {
        contractAddress,
        userId,
      },
    });
    return {
      message: "success",
      contractAddress,
    };
  };
  getCollections = async (params, userId = this.userId) => {
    const { limit, page, search, liked, favorites } = params;
    console.log(liked, favorites);
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
    };
    const includeOptions = userId && [
      {
        model: db.collectionLikes,
        where: {
          userId,
        },
        required: liked ? true : false,
      },
      {
        model: db.collectionFavorites,
        where: {
          userId,
        },
        required: favorites ? true : false,
      },
    ];

    const count = await db.collections.count({
      where: options,
      include: includeOptions,
    });
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);

    const results = await db.collections.findAll({
      where: options,
      include: includeOptions,
      limit,
      offset,
    });

    return {
      limit,
      totalPages,
      page,
      results,
    };
  };
  getSingleCollection = async (field, userId = this.userId) => {
    const collection = await db.collections.findOne({
      where: {
        [Op.or]: [
          {
            name: field,
          },
          {
            contractAddress: field,
          },
        ],
      },
      include: [
        {
          model: db.collectionLikes,
          where: {
            userId,
          },
        },
        {
          model: db.collectionFavorites,
          where: {
            userId,
          },
        },
      ],
    });
    return collection;
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
}

module.exports = Collections;

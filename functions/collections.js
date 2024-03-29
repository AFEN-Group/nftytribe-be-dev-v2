const { Op } = require("sequelize");
const owner = require("@abi/owner");
const db = require("@models");
const moralis = require("./moralis");
const Moralis = require("./Moralis.sdk");
const { Sequelize } = require("../models");
const moment = require("moment");
const Uploads = require("./uploads");
const { redis } = require("@helpers/redis");
const { Worker } = require("worker_threads");
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
        try {
          const sync = await Moralis.EvmApi.nft.syncNFTContract({
            address: contractAddress,
            chain: chainId,
          });
          resolve(sync?.toJSON());
        } catch (err) {
          reject(err);
        }
      }, 1000);
    });

    const result = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const data = await Moralis.EvmApi.nft.getNFTContractMetadata({
            address: contractAddress,
            chain: chainId,
          });
          resolve(data);
        } catch (err) {
          reject(err);
        }
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

    // console.log(ownerAddress, user.walletAddress);

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
            db.Sequelize.literal(
              `
             (select count(id) from collectionLikes where collectionId = collections.id)
            `
            ),
            "likeCount",
          ],
          [
            db.Sequelize.literal(
              `
             (select count(id) from collectionFavorites where collectionId = collections.id)
            `
            ),
            "favoriteCount",
          ],
          [
            Sequelize.literal(`COALESCE((
              SELECT SUM(listingInfo->>'$.nativePrice.value')
              FROM transactions
              WHERE nftInfo->>'$.address' = collections.contractAddress
            ), 0)`),
            "volume",
          ],
          [
            Sequelize.literal(`COALESCE((
              SELECT MIN(listingInfo->>'$.nativePrice.value')
              FROM transactions
              WHERE nftInfo->>'$.address' = collections.contractAddress
            ), 0)`),
            "floorPrice",
          ],

          [
            Sequelize.literal(`(
              select 
                 (((currentVolume.value - lastVolume.value) / 
                 case
                  when lastVolume.value = 0 then 1
                  else lastVolume.value
                  end
                  ) * 100)
              from  (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions 
                where 
                  DATE(transactions.createdAt) = CURDATE()
                and 
                  nftInfo->>'$.address' = collections.contractAddress
              ) currentVolume,
              (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions 
                where 
                  DATE(transactions.createdAt) = '${moment()
                    .subtract(1, "day")
                    .format("YYYY-MM-DD")}'
                and 
                  nftInfo->>'$.address' = collections.contractAddress
              ) lastVolume
            )`),
            "24hrs",
          ],
          [
            Sequelize.literal(`(
              select 
                 (((currentVolume.value - lastVolume.value) / 
                 case
                  when lastVolume.value = 0 then 1
                  else lastVolume.value
                end
                 ) * 100)
              from (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions
                where 
                (
                  DATE(transactions.createdAt)
                  between 
                  '${moment().subtract(1, "week").format("YYYY-MM-DD")}'
                  and
                  CURDATE()
                )
                and
                nftInfo->>'$.address' = collections.contractAddress
              ) currentVolume,
              (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions
                where 
                (
                  DATE(transactions.createdAt)
                  between 
                  '${moment().subtract(2, "week").format("YYYY-MM-DD")}'
                  and
                  '${moment().subtract(1, "week").format("YYYY-MM-DD")}'
                )
                and
                nftInfo->>'$.address' = collections.contractAddress
              ) lastVolume
            )`),
            "7days",
          ],
          [
            Sequelize.literal(`(
              select 
                count(nfts.id) 
              from 
                nfts 
              where 
                moreInfo->>'$.contractAddress' = collections.contractAddress
            )`),
            "totalNfts",
          ],
          [
            Sequelize.literal(`(
            select 
              count(distinct userId) 
            from
              nfts
            where 
              moreInfo->>'$.contractAddress' = collections.contractAddress
          )`),
            "totalOwners",
          ],

          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `
               (select id from collectionLikes where userId = ${userId} and collectionId = collections.id)
              `
              ),
              "DECIMAL"
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `
               (select id from collectionFavorites where userId = ${userId} and collectionId = collections.id)
              `
              ),
              "DECIMAL"
            ),
            "isFavorite",
          ],
        ].filter((data) => data && data),
      },
      include: includeOptions,
      limit,
      offset,
      order: [["volume", "desc"]],
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
            db.Sequelize.literal(
              `(select count(id) from collectionLikes where collectionId = collections.id)`
            ),
            "likeCount",
          ],
          [
            db.Sequelize.literal(
              `(select count(id) from collectionFavorites where collectionId = collections.id)`
            ),
            "favoriteCount",
          ],
          [
            Sequelize.literal(`(
              select IFNULL(sum(listingInfo->>'$.nativePrice.value'), 0)
              from 
                transactions 
              where 
                nftInfo->>'$.address' = collections.contractAddress
            )`),
            "volume",
          ],
          [
            Sequelize.literal(`(
              select IFNULL(min(listingInfo->>'$.nativePrice.value'), 0)
              from 
                transactions 
              where 
                nftInfo->>'$.address' = collections.contractAddress
            )`),
            "floorPrice",
          ],
          [
            Sequelize.literal(`(
              select 
                 (((currentVolume.value - lastVolume.value) / 
                 case 
                  when lastVolume.value = 0 then 1
                  else lastVolume.value
                  end
                  ) * 100)
              from  (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions 
                where 
                  DATE(transactions.createdAt) = CURDATE()
                and 
                  nftInfo->>'$.address' = collections.contractAddress
              ) currentVolume,
              (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions 
                where 
                  DATE(transactions.createdAt) = '${moment()
                    .subtract(1, "day")
                    .format("YYYY-MM-DD")}'
                and 
                  nftInfo->>'$.address' = collections.contractAddress
              ) lastVolume
            )`),
            "24hrs",
          ],
          [
            Sequelize.literal(`(
              select 
                 (((currentVolume.value - lastVolume.value) / 
                 case 
                  when lastVolume.value = 0 then 1
                  else lastVolume.value
                 end
                 ) * 100)
              from (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions
                where 
                (
                  DATE(transactions.createdAt)
                  between 
                  '${moment().subtract(1, "week").format("YYYY-MM-DD")}'
                  and
                  CURDATE()
                )
                and
                nftInfo->>'$.address' = collections.contractAddress
              ) currentVolume,
              (
                select 
                  IFNULL(SUM(listingInfo->>'$.nativePrice.value'), 0) value
                from 
                  transactions
                where 
                (
                  DATE(transactions.createdAt)
                  between 
                  '${moment().subtract(2, "week").format("YYYY-MM-DD")}'
                  and
                  '${moment().subtract(1, "week").format("YYYY-MM-DD")}'
                )
                and
                nftInfo->>'$.address' = collections.contractAddress
              ) lastVolume
            )`),
            "7days",
          ],
          [
            Sequelize.literal(`(
              select 
                count(nfts.id) 
              from 
                nfts 
              where 
                moreInfo->>'$.contractAddress' = collections.contractAddress
            )`),
            "totalNfts",
          ],
          [
            Sequelize.literal(`(
            select 
              count(distinct userId) 
            from
              nfts
            where 
              moreInfo->>'$.contractAddress' = collections.contractAddress
          )`),
            "totalOwners",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `(select id from collectionLikes where userId = ${userId} and collectionId = collections.id)`
              ),
              "boolean"
            ),
            "isLiked",
          ],
          userId && [
            db.Sequelize.cast(
              db.Sequelize.literal(
                `(select id from collectionFavorites where userId = ${userId} and collectionId = collections.id)`
              ),
              "boolean"
            ),
            "isFavorite",
          ],
        ].filter((data) => data && data),
      },
      group: [
        "collections.id",
        "collectionLikes.id",
        "collectionFavorites.id",
        // "nfts.id",
      ],
    });

    const { chain } = await db.chains.findOne({
      where: { id: collection.chainId },
    });

    // getting metadata from moralis
    // const metadata = await Moralis.EvmApi.nft.getNFTContractMetadata({
    //   chain,
    //   address: collection.contractAddress,
    // });
    // console.log(metadata.toJSON());
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
        status: false,
        collectionId,
      };
    } else {
      await db.collectionLikes.create({
        userId,
        collectionId,
      });
      return {
        status: true,
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
        status: false,
        collectionId,
      };
    } else {
      await db.collectionFavorites.create({
        userId,
        collectionId,
      });
      return {
        status: true,
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

  static updateBg = async (id, buffer) => {
    const upload = new Uploads();
    const url = await upload.upload(
      (
        await upload.compressImages([buffer])
      )[0],
      "collections-bg"
    );
    const updated = await db.collections.update(
      { bg: url },
      {
        where: {
          id,
        },
      }
    );
    return { bg: url };
  };

  static updateCollectionPhotos = async ({
    contractAddress,
    type,
    userId,
    key,
  }) => {
    const collection = await db.collections.findOne({
      where: {
        contractAddress,
      },
    });
    const data = JSON.parse(await redis.getdel(key));

    //if collection exists then save else push to worker to retry checking a couple of times in case Moralis takes longer to report
    if (collection) {
      const [update] = await db.collections.update(
        {
          [type]: data[0],
        },
        {
          where: {
            userId,
            contractAddress,
          },
        }
      );
      return update;
    }
    const worker = new Worker("./workers/collectionPhotoUpload.js");
    worker.postMessage({ contractAddress, url: data[0], userId });

    return 1;
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

const { Op } = require("sequelize");
const db = require("../models");
const { Sequelize } = require("../models");
const moment = require("moment");

class Stats {
  getCollectionStats = async (data = {}) => {
    console.log(data);
    const { startDate, endDate, limit, page, chain } = data;
    const offset = (page - 1) * limit;

    const options = {
      createdAt: {
        [Op.and]: {
          [Op.gte]: startDate,
          [Op.lte]: new Date(moment(endDate).add(24, "hours")),
        },
      },
      ...(chain && {
        chainId: chain,
      }),
    };

    const include = [
      {
        model: db.collections,
        required: true,
      },
    ];

    const collections = await db.transactions.findAll({
      where: options,
      subQuery: false,
      attributes: [
        [
          db.Sequelize.fn(
            "SUM",
            db.Sequelize.fn(
              "JSON_EXTRACT",
              db.Sequelize.col("listingInfo"),
              "$.nativePrice.value"
            )
          ),
          "nativeVol",
        ],
        [
          db.Sequelize.fn(
            "MIN",
            db.sequelize.fn(
              "JSON_EXTRACT",
              db.Sequelize.col("listingInfo"),
              "$.nativePrice.value"
            )
          ),
          "floorPrice",
        ],
        [
          Sequelize.literal(
            `(
                SELECT (difference * 100 / original) FROM (
                    SELECT ( latest - original) difference, original
                    FROM (
                        SELECT 
                            (SELECT JSON_EXTRACT(listingInfo, '$.nativePrice.value') FROM transactions WHERE createdAt <= '${moment(
                              startDate
                            ).format(
                              "YYYY-MM-DD"
                            )}' OR createdAt LIKE '${moment(startDate).format(
              "YYYY-MM-DD%"
            )}' ORDER BY id DESC LIMIT 1) original,
                            (SELECT JSON_EXTRACT(listingInfo, '$.nativePrice.value') FROM transactions WHERE createdAt <= '${moment(
                              endDate
                            ).format(
                              "YYYY-MM-DD"
                            )}' OR createdAt LIKE '${moment(endDate).format(
              "YYYY-MM-DD%"
            )}' ORDER BY id DESC LIMIT 1) latest
                    ) priceChange
                ) changeOverTime
            )`
          ),
          "priceChange",
        ],
        [
          Sequelize.literal(
            `(
                SELECT COUNT(collectionId)
            )`
          ),
          "salesCount",
        ],
      ],
      include,
      group: ["collectionId"],
      limit,
      offset,
      order: [["salesCount", "desc"]],
    });

    return {
      results: collections,
    };
  };
}

module.exports = Stats;

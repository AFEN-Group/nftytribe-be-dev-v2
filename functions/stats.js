const { Op } = require("sequelize");
const db = require("../models");
const { Sequelize } = require("../models");
const moment = require("moment");
class Stats {
  getCollectionStats = async (data = {}) => {
    const { startDate, endDate, limit, page, chain } = data;
    const offset = (page - 1) * limit;
    //get collection with highest buy based on date
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
        // [
        //   db.Sequelize.fn("DISTINCT", db.Sequelize.col("collectionId")),
        //   "collectionId",
        // ],
        [
          db.Sequelize.fn(
            "SUM",
            db.Sequelize.fn(
              "JSON_EXTRACT",
              db.Sequelize.col("listingInfo"),
              db.Sequelize.literal(`"$.nativePrice.value"`)
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
              db.Sequelize.literal("'$.nativePrice.value'")
            )
          ),
          "floorPrice",
        ],
        [
          Sequelize.literal(
            `(
                select (difference * 100 / original) from (
                    select ( latest - original) difference, original
                    from (
                        select 
                            (select json_extract(listingInfo, "$.nativePrice.value") from transactions where createdAt <= '${moment(
                              startDate
                            ).format(
                              "YYYY-MM-DD"
                            )}' or createdAt like '${moment(startDate).format(
              "YYYY-MM-DD%"
            )}' order by id desc limit 1 ) original,
                            (select json_extract(listingInfo, "$.nativePrice.value") from transactions where createdAt <= '${moment(
                              endDate
                            ).format(
                              "YYYY-MM-DD"
                            )}' or createdAt like '${moment(endDate).format(
              "YYYY-MM-DD%"
            )}' order by id desc limit 1) latest) priceChange
                ) changeOverTime
            )`
          ),
          "priceChange",
        ],
        [
          Sequelize.literal(
            `(
                select count(collectionId)  
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

// console.log(moment().add(0, "days"));

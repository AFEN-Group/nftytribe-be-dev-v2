const { body, param, query } = require("express-validator");
const db = require("../../models");
const { redis } = require("../../helpers/redis");
const NODE_ENV = process.env.NODE_ENV;
const getNftsValidations = [
  param("field").not().isEmpty().trim().escape(),
  query("limit").toInt().default(10),
  query("chain").not().isEmpty(),
  // .toInt()
  // .isInt()
  // .custom(async (id) => {
  //   const chain = await db.chains.findOne({ where: { id } });
  //   if (!chain) throw "chain is not supported";
  //   return true;
  // }),
];

const getListingValidation = [
  query("userId").optional({ checkFalsy: true }).toInt(),
  query("lazyMint").optional().toBoolean(true),
  query("isLiked").optional().toBoolean(true),
  query("isWatched").optional().toBoolean(true),
  query("isFavorite").optional().toBoolean(true),
  query("hasCollection").toBoolean(true).optional(),
  query("physical").toBoolean(true).optional(),
  query("owner").optional({ checkFalsy: true }),
  query("category").optional({ checkFalsy: true }),
  query("collection").toInt().optional({ checkFalsy: true }),
  query("chain").not().isEmpty().isInt(),
  query("search").optional({ checkFalsy: true }),
  query("priceLowest").optional({ checkFalsy: true }),
  query("priceHighest").optional({ checkFalsy: true }),
  query("listingType").optional(),
  query("fromDate").isDate().optional({ checkFalsy: false }),
  query("toDate").isDate().optional({ checkFalsy: false }),
  query("limit").toInt().default(10),
  query("page").toInt().default(1),
  query("order").default("createdAt"),
  query("direction").default("DESC"),
];

const favorite_like_Validations = [
  param("nftId")
    .not()
    .isEmpty()
    .custom(async (id) => {
      const nft = await db.nfts.findOne({
        where: { id },
      });
      if (!nft) throw "nft not found";
      true;
    }),
];

const getBiddingValidations = [
  param("nftId").not().isEmpty(),
  query("limit").toInt().default(10),
  query("page").toInt().default(1),
];

const addWatchValidations = [param("nftId").not().isEmpty().toInt()];

const getWatchersValidations = [
  param("nftId").not().isEmpty().toInt(),
  query("page").toInt().default(1),
  query("limit").toInt().default(10),
];

const singleWalletNftVerifications = [
  query(["tokenId", "chain", "contractAddress"]).not().isEmpty(),
];

const getTransactionsValidation = [
  query(["limit", "page"]).toInt(),
  query("limit").default(10),
  query("page").default(1),
  query("type").default("sold"),
];

const createPhysicalItemValidations = [
  body([
    "name",
    "description",
    "unit_weight",
    "unit_amount",
    "quantity",
    "address_code",
    "width",
    "height",
    "length",
    "category_id",
  ]).notEmpty(),

  body("imageKey")
    .optional({ checkFalsy: true })
    .custom(async (key) => {
      if (key.trim() !== "") {
        const data = await redis.get(key);
        if (!data) throw "key has either does not exist or has expired!";
      }
      return key;
    }),
].filter((data) => data && data);

const newNftValidations = [
  body(["name", "description", "imageKey"]).not().isEmpty(),
  body("lazyMint").isBoolean(),
  body("imageKey").custom(async (key, { req }) => {
    const data = await redis.getdel(key);
    if (!data) throw "invalid key";
    //set image from redis to image
    req.image = JSON.parse(data);
    return true;
  }),
  body("website").optional({ checkFalsy: true }).isURL(),
  //handle validation for if lazy minting is true
];
module.exports = {
  getNftsValidations,
  getListingValidation,
  favorite_like_Validations,
  getBiddingValidations,
  addWatchValidations,
  getWatchersValidations,
  singleWalletNftVerifications,
  getTransactionsValidation,
  createPhysicalItemValidations,
  newNftValidations,
};

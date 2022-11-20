const { body, param, query } = require("express-validator");
const db = require("../../models");

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
  query("userId").optional({ checkFalsy: true }),
  query("lazyMint").toBoolean(true).optional(),
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
  query("direction").default("ASC"),
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
module.exports = {
  getNftsValidations,
  getListingValidation,
  favorite_like_Validations,
};

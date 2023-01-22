const { body, param, query } = require("express-validator");
const db = require("../../models");

const importCollectionValidations = [
  body("contractAddress")
    .not()
    .isEmpty()
    .custom(async (contractAddress) => {
      // if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      //   throw "invalid contract address";
      // }
      // const collection = await db.collections.findOne({
      //   where: {
      //     contractAddress,
      //   },
      // });
      // if (collection) throw "collection already exists!";
      return true;
    }),
  body("chain")
    .not()
    .isEmpty()
    .custom(async (chain) => {
      const chainExist = await db.chains.findOne({ where: { chain } });
      if (!chainExist) throw "chain is not supported";
      return true;
    }),
];

const deleteCollectionValidations = [
  param("id")
    .not()
    .isEmpty()
    .custom(async (id, { req }) => {
      const collection = await db.collections.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });
      if (!collection) throw "collection does not exist";
      return true;
    }),
];

const getCollectionsValidation = [
  query("limit").toInt().default(10),
  query("page").toInt().default(1),
  query("search").optional({ checkFalsy: true }).isString().trim().escape(),
  query("liked").toBoolean().default(false),
  query("favorites").toBoolean().default(false),
];

const getSingleCollectionValidation = [param("id").not().isEmpty()];
const likeCollectionValidation = [param("id").not().isEmpty()];
const favoriteCollectionValidation = [param("id").not().isEmpty()];

module.exports = {
  importCollectionValidations,
  deleteCollectionValidations,
  getCollectionsValidation,
  getSingleCollectionValidation,
  likeCollectionValidation,
  favoriteCollectionValidation,
};

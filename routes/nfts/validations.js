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

module.exports = {
  getNftsValidations,
};

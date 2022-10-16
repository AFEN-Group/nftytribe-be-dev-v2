const { body, param } = require("express-validator");
const db = require("../../models");

const addChainValidations = [
  body("name")
    .not()
    .isEmpty()
    .custom(async (name) => {
      const chain = await db.chains.findOne({
        where: { name },
      });
      if (chain) throw "chain with name already exists";
      return true;
    }),
  body("symbol")
    .not()
    .isEmpty()
    .custom(async (symbol) => {
      const chain = await db.chains.findOne({
        where: { symbol },
      });
      if (chain) throw "chain with symbol already exists";
      return true;
    }),
];

const removeChainSupport = [
  param("id")
    .not()
    .isEmpty()
    .custom(async (id) => {
      const chain = await db.chains.findOne({
        where: { id },
      });
      if (!chain) throw "chain not found";
      return true;
    }),
];

module.exports = {
  addChainValidations,
  removeChainSupport,
};

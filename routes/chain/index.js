const {
  getSupportedChains,
  addSupportedChain,
  removeSupportForChain,
} = require("../../controllers/chain");
const { addChainValidations, removeChainSupport } = require("./validations");

const chain = require("express").Router();

chain
  .route("/")
  .get(getSupportedChains)
  .post(addChainValidations, addSupportedChain);
chain.route("/:id").delete(removeChainSupport, removeSupportForChain);

module.exports = chain;

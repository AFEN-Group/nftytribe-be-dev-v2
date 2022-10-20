const { getNfts } = require("../../controllers/nft");
const { getNftsValidations } = require("./validations");

const nfts = require("express").Router();

nfts.route("/user/:field").get(getNftsValidations, getNfts);
module.exports = nfts;

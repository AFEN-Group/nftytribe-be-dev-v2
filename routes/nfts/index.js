const { getNfts, getListings } = require("../../controllers/nft");
const { getNftsValidations, getListingValidation } = require("./validations");

const nfts = require("express").Router();

nfts.route("/user/:field").get(getNftsValidations, getNfts);
nfts.route("/listings").get(getListingValidation, getListings);
module.exports = nfts;

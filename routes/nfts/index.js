const {
  getNfts,
  getListings,
  likeListing,
  favoriteListing,
} = require("../../controllers/nft");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  getNftsValidations,
  getListingValidation,
  favorite_like_Validations,
} = require("./validations");

const nfts = require("express").Router();

nfts.route("/user/:field").get(getNftsValidations, getNfts);
nfts.route("/listings").get(getListingValidation, getListings);
nfts
  .route("/like/:nftId")
  .post(userProtect, favorite_like_Validations, likeListing);
nfts
  .route("/favorite/:nftId")
  .post(userProtect, favorite_like_Validations, favoriteListing);
module.exports = nfts;

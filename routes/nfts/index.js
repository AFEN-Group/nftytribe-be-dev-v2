const {
  getNfts,
  getListings,
  likeListing,
  favoriteListing,
  getSingleNftListing,
  getBids,
  watchListings,
  getWatchers,
} = require("../../controllers/nft");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  getNftsValidations,
  getListingValidation,
  favorite_like_Validations,
  getBiddingValidations,
  getWatchersValidations,
  addWatchValidations,
} = require("./validations");

const nfts = require("express").Router();

nfts.route("/user/:field").get(getNftsValidations, getNfts);
nfts.route("/listings").get(getListingValidation, getListings);
nfts.route("/listings/:id").get(getSingleNftListing);
nfts
  .route("/listings/:nftId/watch")
  .get(getWatchersValidations, getWatchers)
  .post(userProtect, addWatchValidations, watchListings);
nfts
  .route("/like/:nftId")
  .post(userProtect, favorite_like_Validations, likeListing);
nfts
  .route("/favorite/:nftId")
  .post(userProtect, favorite_like_Validations, favoriteListing);
nfts.route("/bids/:nftId").get(getBiddingValidations, getBids);
module.exports = nfts;

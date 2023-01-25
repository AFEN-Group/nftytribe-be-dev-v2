const {
  getNfts,
  getListings,
  likeListing,
  favoriteListing,
  getSingleNftListing,
  getBids,
  watchListings,
  getWatchers,
  singleWalletNft,
  getTransactions,
  newPhysicalItem,
  newNft,
} = require("../../controllers/nft");
const { tempUploads } = require("../../helpers/multer");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  getNftsValidations,
  getListingValidation,
  favorite_like_Validations,
  getBiddingValidations,
  getWatchersValidations,
  addWatchValidations,
  singleWalletNftVerifications,
  getTransactionsValidation,
  createPhysicalItemValidations,
  newNftValidations,
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
nfts.route("/meta-data").get(singleWalletNftVerifications, singleWalletNft);
nfts
  .route("/transactions")
  .get(userProtect, getTransactionsValidation, getTransactions);
nfts
  .route("/physical-item")
  .post(createPhysicalItemValidations, newPhysicalItem);

nfts.route("/create-nft").post(userProtect, newNftValidations, newNft);
module.exports = nfts;

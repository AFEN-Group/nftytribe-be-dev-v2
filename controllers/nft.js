const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const checkError = require("../functions/checkError");
const Nfts = require("../functions/nfts");

const getNfts = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const nfts = await new Nfts().getNfts(req.query, req.params.field);
  res.send(nfts);
});
const getSingleNftListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.params;
  const { userId } = req.query;
  res.send(await new Nfts().getSingleListing(id, userId));
});
const ListNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const options = req.query;
  const result = await new Nfts().getListings(options);
  res.send(result);
});
const watchListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const bidListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getBids = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const likeListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.user;
  const result = await new Nfts().likeUnlike(id, req.params.nftId);
  res.send(result);
});
const favoriteListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.user;
  const result = await new Nfts().favoriteUnfavorite(id, req.params.nftId);
  res.send(result);
});

module.exports = {
  getNfts,
  getSingleNftListing,
  ListNft,
  getListings,
  watchListings,
  bidListings,
  getBids,
  likeListing,
  favoriteListing,
};

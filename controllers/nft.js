const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const checkError = require("../functions/checkError");
const Nfts = require("../functions/nfts");

const getNfts = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const nfts = await new Nfts().getNfts(req.query, req.params.field);
  res.send(nfts);
});
const getSingleNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
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

module.exports = {
  getNfts,
  getSingleNft,
  ListNft,
  getListings,
  watchListings,
  bidListings,
  getBids,
};

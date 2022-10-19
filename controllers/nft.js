const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const checkError = require("../functions/checkError");

const getNfts = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getSingleNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const ListNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
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

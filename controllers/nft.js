const expressAsyncHandler = require("express-async-handler");
const { validationResult, matchedData } = require("express-validator");
const checkError = require("../functions/checkError");
const Nfts = require("../functions/nfts");
const { createPhysicalItems } = require("../functions/physicalItems");

const getNfts = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const nfts = await new Nfts().getNfts(req.query, req.params.field);
  res.send(nfts);
});

const getTransactions = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { type, limit, page } = req.query;
  const result =
    type.toLowerCase() === "sold"
      ? await new Nfts().getSold({ page, limit }, req.user.id)
      : await new Nfts().getCollected({ page, limit }, req.user.id);

  res.send(result);
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
  const { id } = req.user;
  const { nftId } = req.params;
  const result = await new Nfts().watchListing(nftId, id);
  res.send(result);
});
const getWatchers = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { nftId } = req.params;
  const result = await new Nfts().getWatchers(nftId, req.query);
  res.send(result);
});
const bidListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getBids = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { nftId } = req.params;
  const bids = await new Nfts().getBids(nftId, req.query);
  res.send(bids);
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

const singleWalletNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { tokenId, contractAddress, chain } = req.query;
  const result = await new Nfts().getNftMetaData(
    tokenId,
    contractAddress,
    chain
  );
  res.send(result);
});

const newPhysicalItem = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, { locations: ["body"] });
  const newItem = await createPhysicalItems(data);
  res.send(newItem);
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
  getWatchers,
  singleWalletNft,
  getTransactions,
  newPhysicalItem,
};

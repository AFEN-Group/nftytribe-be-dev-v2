const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const checkError = require("@functions/checkError");
const Collections = require("@functions/collections");
const Uploads = require("@functions/uploads");

const importCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { chain, contractAddress } = req.body;
  let coverImage;

  if (req.file) {
    const location = await new Uploads().uploadAvatar(
      [req.file.buffer],
      "collectionCover"
    );
    coverImage = location;
  }

  const collection = await new Collections().importCollection(
    contractAddress,
    chain,
    req.user.walletAddress,
    coverImage
  );
  res.send(collection);
});

const getAllCollections = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const collections = await new Collections(
    req.user?.id || req.query.userId
  ).getCollections(req.query);

  res.send(collections);
});
const getSingleCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.params;
  const { userId, token } = req.query;
  console.log(token);
  const collection = await new Collections(
    req.user?.id || userId
  ).getSingleCollection(id, undefined, token);

  res.send(collection);
});
const likeCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Collections(req.user.id).likeUnlikeCollection(
    req.params.id
  );
  res.send(result);
});

const favoriteCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Collections(
    req.user.id
  ).favoriteUnfavoriteCollection(req.params.id);
  res.send(result);
});
const deleteCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Collections(req.user.id).deleteCollection(
    req.params.id
  );
  res.send(result);
});

const updateCollectionBg = expressAsyncHandler(async (req, res) => {
  const { params, file } = req;
  if (!file)
    throw { status: 400, message: "please select an image for upload" };
  const data = await Collections.updateBg(params.id, file.buffer);
  res.send(data);
});

module.exports = {
  importCollection,
  getAllCollections,
  getSingleCollection,
  likeCollection,
  favoriteCollection,
  deleteCollection,
  updateCollectionBg,
};

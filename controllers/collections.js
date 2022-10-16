const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const checkError = require("../functions/checkError");
const Collections = require("../functions/collections");
const Uploads = require("../functions/uploads");

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

  const collection = await new Collections(req.user.id).importCollection(
    contractAddress,
    chain,
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
});
const likeCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const unlikeCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const favoriteCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const deleteCollection = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
module.exports = {
  importCollection,
  getAllCollections,
  getSingleCollection,
  likeCollection,
  unlikeCollection,
  favoriteCollection,
  deleteCollection,
};

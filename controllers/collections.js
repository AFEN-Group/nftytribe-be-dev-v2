const expressAsyncHandler = require("express-async-handler");
const { validationResult, matchedData } = require("express-validator");
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
  console.log(req.user?.id);
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

const updateCollectionPhotos = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req, validationResult, {
    matchedData,
    locations: ["params", "body"],
  });
  const update = await Collections.updateCollectionPhotos({
    ...data,
    userId: req.user.id,
  });

  if (update) res.send({ status: "updated" });
  else
    res.send({
      status: "Nothing to update, check that the contract belongs to you!",
    });
});

module.exports = {
  importCollection,
  getAllCollections,
  getSingleCollection,
  likeCollection,
  favoriteCollection,
  deleteCollection,
  updateCollectionPhotos,
};

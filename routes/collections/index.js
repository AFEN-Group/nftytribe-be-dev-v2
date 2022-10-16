const {
  getAllCollections,
  importCollection,
  likeCollection,
  favoriteCollection,
  deleteCollection,
  getSingleCollection,
} = require("../../controllers/collections");
const userProtect = require("../../middlewares/userProtect.middleware");
const { avatarUpload } = require("../user/validations");
const {
  getCollectionsValidation,
  importCollectionValidations,
  likeCollectionValidation,
  favoriteCollectionValidation,
  deleteCollectionValidations,
  getSingleCollectionValidation,
} = require("./validations");

const collections = require("express").Router();

collections
  .route("/")
  .get(getCollectionsValidation, getAllCollections)
  .post(
    userProtect,
    avatarUpload.single("coverImage"),
    importCollectionValidations,
    importCollection
  );

collections
  .route("/:id/like")
  .post(userProtect, likeCollectionValidation, likeCollection);

collections
  .route("/:id/favorite")
  .post(userProtect, favoriteCollectionValidation, favoriteCollection);

collections
  .route("/:id")
  .delete(userProtect, deleteCollectionValidations, deleteCollection)
  .get(getSingleCollectionValidation, getSingleCollection);

module.exports = collections;

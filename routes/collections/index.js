const {
  getAllCollections,
  importCollection,
  likeCollection,
  favoriteCollection,
  deleteCollection,
  getSingleCollection,
  updateCollectionBg,
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
  uploadBgValidations,
} = require("./validations");
const { tempUploads } = require("helpers/multer");

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

collections
  .route("/:id/bg")
  .patch(
    userProtect,
    tempUploads.single("bg"),
    uploadBgValidations,
    updateCollectionBg
  );

module.exports = collections;

const {
  getAllCollections,
  importCollection,
  likeCollection,
  favoriteCollection,
  deleteCollection,
  getSingleCollection,
  updateCollectionPhotos,
} = require("@controllers/collections");
const userProtect = require("@middlewares/userProtect.middleware");
const { avatarUpload } = require("../user/validations");
const {
  getCollectionsValidation,
  importCollectionValidations,
  likeCollectionValidation,
  favoriteCollectionValidation,
  deleteCollectionValidations,
  getSingleCollectionValidation,
  genCollectionPhotoValidation,
} = require("./validations");
const { tryGetUser } = require("@middlewares/tryGetUser");

const collections = require("express").Router();

collections
  .route("/")
  .get(tryGetUser, getCollectionsValidation, getAllCollections)
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
  .get(tryGetUser, getSingleCollectionValidation, getSingleCollection);

collections
  .route("/:type/:contractAddress/")
  .patch(userProtect, genCollectionPhotoValidation, updateCollectionPhotos);

// collections
//   .route("/:id/bg")
//   .patch(
//     userProtect,
//     tempUploads.single("bg"),
//     uploadBgValidations,
//     updateCollectionBg
//   );

module.exports = collections;

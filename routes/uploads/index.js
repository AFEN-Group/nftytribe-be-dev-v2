const {
  tempUploads,
  tempNft,
  tempNftUploads,
} = require("../../controllers/uploads");
const { tempUploads: temp } = require("../../helpers/multer");
const userProtect = require("../../middlewares/userProtect.middleware");

const uploads = require("express").Router();

uploads.route("/temp").post(userProtect, temp.array("images", 4), tempUploads);
uploads
  .route("/temp/nft")
  .post(userProtect, temp.single("image"), tempNftUploads);
module.exports = uploads;

const { tempUploads } = require("../../controllers/uploads");
const { tempUploads: temp } = require("../../helpers/multer");

const uploads = require("express").Router();

uploads.route("/temp").post(temp.array("images", 4), tempUploads);
module.exports = uploads;

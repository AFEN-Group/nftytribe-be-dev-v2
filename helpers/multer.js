const multer = require("multer");

exports.tempUploads = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5e6,
    fieldSize: 2e7,
  },
});

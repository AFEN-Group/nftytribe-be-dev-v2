const expressAsyncHandler = require("express-async-handler");
const checkError = require("../functions/checkError");
const { validationResult } = require("express-validator");

exports.getCollectionStats = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  res.send();
});

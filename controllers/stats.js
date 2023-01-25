const expressAsyncHandler = require("express-async-handler");
const checkError = require("@functions/checkError");
const { validationResult } = require("express-validator");
const Stats = require("@functions/stats");

exports.getCollectionStats = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Stats().getCollectionStats(req.query);
  res.send(result);
});

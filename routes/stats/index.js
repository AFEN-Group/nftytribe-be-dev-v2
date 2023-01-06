const collectionStats = require("express").Router();
const { getCollectionStats } = require("../../controllers/stats");
const { collectionStatsValidations } = require("./validations");

collectionStats.route("/").get(collectionStatsValidations, getCollectionStats);

module.exports = collectionStats;

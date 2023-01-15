const categories = require("./categories");
const chain = require("./chain");
const collections = require("./collections");
const nfts = require("./nfts");
const collectionStats = require("./stats");
const uploads = require("./uploads");
const user = require("./user");

const route = require("express").Router();

route.use("/user", user);
route.use("/collection/stats", collectionStats);
route.use("/collection", collections);
route.use("/nft", nfts);
route.use("/chain", chain);
route.use("/category", categories);
route.use("/uploads", uploads);

module.exports = route;

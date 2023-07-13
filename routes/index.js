// const { BubbleValidations } = require("@helpers/bubble");
const categories = require("./categories");
const chain = require("./chain");
const collections = require("./collections");
// const deliveryChannels = require("./deliveryChannels");
const nfts = require("./nfts");
const notification = require("./notifications");
const collectionStats = require("./stats");
const uploads = require("./uploads");
const user = require("./user");
const shipment = require("./shipment");
const announcements = require("./announcements");

const route = require("express").Router();

route.use("/user", user);
route.use("/collection/stats", collectionStats);
route.use("/collection", collections);
route.use("/nft", nfts);
route.use("/chain", chain);
route.use("/category", categories);
route.use("/uploads", uploads);
route.use("/shipment", shipment);
route.use("/notifications", notification);
route.use("/announcements", announcements);

module.exports = route;

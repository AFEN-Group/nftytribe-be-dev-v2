const categories = require("./categories");
const chain = require("./chain");
const collections = require("./collections");
const user = require("./user");

const route = require("express").Router();

route.use("/user", user);

route.use("/collection", collections);
// route.use("/nft");
route.use("/chain", chain);
route.use("/category", categories);

module.exports = route;

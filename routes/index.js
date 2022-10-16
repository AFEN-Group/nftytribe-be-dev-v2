const chain = require("./chain");
const collections = require("./collections");
const user = require("./user");

const route = require("express").Router();

route.use("/user", user);

route.use("/collection", collections);
// route.use("/nft");
route.use("/chain", chain);
// route.use("/category");
// route.use("/listing");

module.exports = route;

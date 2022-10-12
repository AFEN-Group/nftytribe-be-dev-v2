const user = require("./user");

const route = require("express").Router();

route.use(user);

// route.use("/collection");
// route.use("/nft");
// route.use("/chain");
// route.use("/category");
// route.use("/listing");

module.exports = route;

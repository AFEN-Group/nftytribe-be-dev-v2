const broker = require("./broker");
const collections = require("./collections");

const hooks = require("express").Router();

hooks.use("/collections", collections);
hooks.use("/broker", broker);

module.exports = hooks;

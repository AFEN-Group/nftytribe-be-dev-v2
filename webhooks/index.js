const collections = require("./collections");

const hooks = require("express").Router();

hooks.use("/collections", collections);

module.exports = hooks;

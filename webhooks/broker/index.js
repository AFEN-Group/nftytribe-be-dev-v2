const expressAsyncHandler = require("express-async-handler");

const broker = require("express").Router();

broker.route("/").post(
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    res.send();
  })
);

module.exports = broker;

const expressAsyncHandler = require("express-async-handler");
const Collections = require("@functions//collections");
const collections = require("express").Router();

collections.route("/").post(
  expressAsyncHandler(async (req, res) => {
    try {
      if (req.body.confirmed) {
        const data = {
          timestamp: req.body.block.timestamp,
          chainId: req.body.chainId,
          contractAddress: "0x" + String(req.body.logs[0].topic1).slice(26),
          walletAddress: "0x" + String(req.body.logs[0].topic2).slice(26),
        };

        console.log(data);

        await new Collections().importCollection(
          data.contractAddress,
          data.chainId,
          data.walletAddress
        );
      } else {
        console.log("not confirmed");
      }
    } catch (err) {
      console.log(err);
    }
    res.send();
  })
);

module.exports = collections;

const expressAsyncHandler = require("express-async-handler");
const brokerV2 = require("../../abi/brokerV2");
const broker = require("express").Router();

const abiDecoder = require("abi-decoder");
abiDecoder.addABI(brokerV2.brokerV2);

broker.route("/on-sale").post(
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body);
    const { txs, chainId, confirmed } = req.body;
    const [txsData] = txs;
    if (txsData) {
      const { fromAddress, input } = txsData;
      const data = abiDecoder.decodeMethod(input);
      console.log(data);
    }

    res.send();
  })
);
broker.route("/off-sale").post(
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body);
    const { txs, chainId, confirmed } = req.body;
    const [txsData] = txs;
    if (txsData) {
      const { fromAddress, input } = txsData;
      const data = abiDecoder.decodeMethod(input);
    }

    res.send();
  })
);

module.exports = broker;

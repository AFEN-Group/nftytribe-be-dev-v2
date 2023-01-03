const expressAsyncHandler = require("express-async-handler");
const brokerV2 = require("../../abi/brokerV2");
const broker = require("express").Router();

const abiDecoder = require("abi-decoder");
const Nfts = require("../../functions/nfts");
abiDecoder.addABI(brokerV2.brokerV2);

broker.route("/").post(
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body);
    const { txs, chainId, confirmed } = req.body;
    const [txsData] = txs;
    if (txsData && !confirmed) {
      const { fromAddress, input } = txsData;
      const data = abiDecoder.decodeMethod(input);
      const nfts = new Nfts();
      console.log(data);

      if (data.name.toLowerCase() === "putsaleoff") {
        //handle putting sale off
        const [tokenId, address] = data.params;

        const putOffSale = await nfts.putOffSale(
          address.value,
          fromAddress,
          tokenId.value
        );
      }

      if (data.name.toLowerCase() === "putonsale") {
        const newListing = await nfts.putOnSale(
          data.params,
          fromAddress,
          chainId
        );
      }

      if (data.name.toLowerCase() === "bid") {
        const newBid = await nfts.newBid(data.params, fromAddress);
      }
    } else if (txsData && confirmed) {
      //changed confirmed to true
    }

    res.send();
  })
);

module.exports = broker;

const expressAsyncHandler = require("express-async-handler");
const brokerV2 = require("../../abi/brokerV2");
const broker = require("express").Router();
const { Worker } = require("worker_threads");
const abiDecoder = require("abi-decoder");
const Nfts = require("@functions/nfts");
const NotificationTypes = require("@types/notificationTypes");
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
      // WORKER FOR NOTIFICATION PROCESSING
      const workerWatch = new Worker("./workers/watchNotification.js");

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

        //
      }

      if (data.name.toLowerCase() === "bid") {
        const newBid = await nfts.newBid(data.params, fromAddress);
        workerWatch.postMessage("message", {
          type: NotificationTypes.BID_PLACED_WATCH,
          listingId: newBid.nftId,
          socket: undefined,
        });

        // db.notifications.
      }
      if (data.name.toLowerCase() === "buy") {
        const newSales = await nfts.buyNft(data.params, fromAddress);
        workerWatch.postMessage("message", {
          type: NotificationTypes.SOLD_WATCH,
          listingId: newSales.nftId,
          extraData: {
            ...newSales.listingInfo,
          },
          socket: undefined,
        });

        await db.notifications.generateNotification(
          NotificationTypes.SOLD,
          null,
          newSales.listingInfo
        );

        //push via socket
      }
    } else if (txsData && confirmed) {
      //changed confirmed to true
    }

    res.send();
  })
);

module.exports = broker;

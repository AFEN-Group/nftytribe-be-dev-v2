const expressAsyncHandler = require("express-async-handler");
const brokerV2 = require("../../abi/brokerV2");
const broker = require("express").Router();
const { Worker } = require("worker_threads");
const abiDecoder = require("abi-decoder");
const Nfts = require("@functions/nfts");
const db = require("@models");
const NotificationTypes = require("@types/notificationTypes");
const physicalItemAbi = require("../../abi/physicalItemsBroker.json");
const PIProxyAbi = require("../../abi/piProxy.json");
abiDecoder.addABI(brokerV2.brokerV2);
abiDecoder.addABI(physicalItemAbi);
abiDecoder.addABI(PIProxyAbi);

broker.route("/").post(
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body);
    const { txs, chainId, confirmed } = req.body;
    // console.log(chainId);
    const [txsData] = txs;
    if (txsData && !confirmed) {
      const { fromAddress, input } = txsData;
      const data = abiDecoder.decodeMethod(input);
      const nfts = new Nfts();

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

        const multiNotificationWorker = new Worker(
          "./workers/multiNotifications.js"
        );

        newListing.collectionId &&
          multiNotificationWorker.postMessage({
            type: NotificationTypes.NEW_LISTING_COLLECTION,
            nftId: newListing.id,
            listingId: newListing.id,
            collectionId: newListing.collectionId,
            name: "favorite",
          });
      }

      if (data.name.toLowerCase() === "bid") {
        const newBid = await nfts.newBid(data.params, fromAddress);
        // notifications
        const worker = new Worker("./workers/singleNotifications.js");
        worker.postMessage({
          nftId: newBid.listing.id,
          title: newBid.listing.name,
          tokenId: newBid.listing.tokenId,
          type: NotificationTypes.BID_PLACED,
          userId: newBid.listing.userId,
        });
      }
      if (data.name.toLowerCase() === "buy") {
        const newSales = await nfts.buyNft(data.params, fromAddress);

        console.log(newSales, "newSale");
        // ..notifcations
        const worker = new Worker("./workers/singleNotifications.js");
        const notificationData = {
          transactionId: newSales.id,
          title: newSales.listingInfo.name,
          tokenId: newSales.listingInfo.tokenId,
          type: NotificationTypes.SOLD,
          userId: newSales.sellerId,
          // buyerId: newSales.buyerId,
        };
        worker.postMessage(notificationData);
      }
    } else if (txsData && confirmed) {
      //changed confirmed to true
    }

    res.send();
  })
);

const testData = require("./demoPhysicalProxy.json");
const { Op } = require("sequelize");
broker.route("/physical-item").post(async (req, res) => {
  const { txs, chainId, confirmed } = testData;
  const { input, fromAddress } = txs[0];
  if (confirmed && txs.length) {
    const { name, params } = abiDecoder.decodeMethod(input);
    if (name.toLowerCase() === "buy") {
      const nft = new Nfts();
      //get arrange fields
      const { tokenId, erc721, price } = nft.getFields(params);
      //get listing
      const listing = await db.nfts.findOne({
        where: {
          tokenId,
          moreInfo: {
            contractAddress: erc721,
          },
        },
        include: [
          {
            model: db.physicalItems,
            required: true,
          },
        ],
      });

      if (!listing) {
        //register an error, an attempt to purchase something that does not exist
        return;
      }
      const listingPrice = listing.price;
    }
  }

  res.send();
});
module.exports = broker;

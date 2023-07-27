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
const Moralis = require("@functions/Moralis.sdk");
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const env = process.env.NODE_ENV;

broker.route("/").post(
  expressAsyncHandler(async (req, res) => {
    // console.log(req.body);
    const { txs, chainId, confirmed } = req.body;
    // console.log(chainId);
    const [txsData] = txs;
    if (txsData && confirmed) {
      const { fromAddress, input } = txsData;
      const data = abiDecoder.decodeMethod(input);
      const nfts = new Nfts();

      if (data.name.toLowerCase() === "putsaleoff") {
        //handle putting sale off
        const [tokenId, address] = data.params;

        const result = await nfts.putOffSale(
          address.value,
          fromAddress,
          tokenId.value
        );

        //notification
        const event = await db.notificationEvents.findOne({
          where: {
            name: "PutOffSale",
          },
        });
        if (event) {
          const notification = await db.notifications.create(
            {
              userId: result.user.id,
              notificationEventId: event.id,
              parameters: {
                nft_name: result.nft.name,
                username: result.user.username,
              },
            },
            {
              include: {
                model: db.notificationEvents,
              },
            }
          );

          //emit through socket
        }
      }

      if (data.name.toLowerCase() === "putonsale") {
        const result = await nfts.putOnSale(data.params, fromAddress, chainId);
        const event = await db.notificationEvents.findOne({
          where: {
            name: "PutOnSale",
          },
        });
        const notification = await db.notifications.create(
          {
            parameters: {
              username: result.user.username,
              nft_name: result.nft.name,
              listingId: result.nft.id,
            },
            notificationEventId: event.id,
            userId: result.user.id,
          },
          {
            include: {
              model: db.notificationEvents,
            },
          }
        );

        //emit notification
      }

      if (data.name.toLowerCase() === "bid") {
        const result = await nfts.newBid(data.params, fromAddress);
        // create notification
        const event = await db.notificationEvents.findOne({
          where: {
            name: "NewBid",
          },
        });

        const notification = await db.notifications.create(
          {
            parameters: {
              listingId: result.listing.id,
              username: result.listing.user.username,
              nft_name: result.listing.name,
            },
            userId: result.listing.userId,
            notificationEventId: event.id,
          },
          {
            include: {
              model: db.notificationEvents,
            },
          }
        );

        //emit notification
      }

      if (data.name.toLowerCase() === "buy") {
        const result = await nfts.buyNft(data.params, fromAddress);
        const event = await db.notificationEvents.findOne({
          where: {
            name: "NFTSold",
          },
        });
        const event2 = await db.notificationEvents.findOne({
          where: {
            name: "SuccessfulPurchase",
          },
        });
        const seller = await db.users.findOne({
          where: {
            id: result.transaction.sellerId,
          },
        });
        const notification = await db.notifications.create(
          {
            parameters: {
              transactionId: result.transaction.id,
              username: seller.username,
              nft_name: result.transaction.listingInfo.name,
              price: result.transaction.listingInfo.price,
              currency: result.transaction.erc20Info.symbol,
            },
            userId: result.transaction.sellerId,
            notificationEventId: event.id,
          },
          {
            include: {
              model: db.notificationEvents,
            },
          }
        );
        //emit to seller

        const notification2 = await db.notifications.create(
          {
            parameters: {
              transactionId: result.transaction.id,
              username: result.buyer.username,
              nft_name: result.transaction.listingInfo.name,
              price: result.transaction.listingInfo.price,
              currency: result.transaction.erc20Info.symbol,
            },
            userId: result.buyer.id,
            notificationEventId: event2.id,
          },
          {
            include: {
              model: db.notificationEvents,
            },
          }
        );
        // emit notification to buyer
      }
    } else if (txsData && confirmed) {
      //changed confirmed to true
    }

    res.send();
  })
);

// const testData = require("./demoPhysicalProxy.json");

const { redis } = require("@helpers/redis");
const { BubbleDelivery } = require("@helpers/bubble");
const initWeb3 = require("@helpers/web3");
const { logger } = require("@helpers/logger");

broker.route("/physical-item").post(async (req, res) => {
  const { txs, chainId, confirmed, logs } = req.body;
  if (txs[0]) {
    const { input, fromAddress, toAddress } = txs[0];
    if (confirmed && txs.length) {
      console.log("passed--- confirmed");
      const nfts = new Nfts();
      const { name, params } = abiDecoder.decodeMethod(input);
      if (name.toLowerCase() === "buy") {
        console.log("passed--- buy");
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
            {
              model: db.users,
              include: [
                {
                  model: db.addresses,
                  required: true,
                },
              ],
            },
          ],
        });

        if (!listing) {
          //register an error, an attempt to purchase something that does not exist
          return;
        }
        console.log("passed--- listing");
        const listingPrice = Number(listing.price);

        const paidPrice =
          Number(price) / 10 ** Number(listing.moreInfo.erc20TokenDecimals);

        const cachedData = JSON.parse(
          await redis.get(`${listing.id}-${fromAddress.toLowerCase()}-booking`)
        );

        // console.log(fromAddress, listing.id);
        if (!cachedData) {
          //handle or log error and refund
          return;
        }
        console.log("passed--- cached data");
        const shippingCostUSD = cachedData.totalUsd;

        const erc20Token =
          env === "production"
            ? listing.dataValues.moreInfo.erc20TokenAddress
            : "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";

        const priceData = await Moralis.EvmApi.token
          .getTokenPrice({
            address: erc20Token,
            chain: env === "production" ? chainId : EvmChain.BSC,
          })
          .catch(console.error);

        const { usdPrice } = priceData.toJSON();
        const shippingCostUSDToChargedToken = shippingCostUSD / usdPrice;

        //adding nft price to generated equivalent
        const totalCharge = shippingCostUSDToChargedToken + listingPrice;

        const privateKey = process.env.p_key;
        const web3 = await initWeb3(chainId);
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);
        const contract = new web3.eth.Contract(PIProxyAbi, toAddress);
        let data;
        let booked;
        console.log(paidPrice, totalCharge, "==== paid and totalcharge");
        if (paidPrice >= totalCharge) {
          //positive -- process release of nft and shipping

          booked = await BubbleDelivery.book(cachedData.data).catch((err) => {
            // log error and refund user possibly
            // change everything happening here, in fact transactions should be reversed
            logger(JSON.stringify(err), "piProxy-listing", "error");
          });
          await db.shipments.create({
            order: booked.data,
            senderId: listing.userId,
            receiverId: (
              await db.users.findOne({
                where: {
                  walletAddress: fromAddress,
                },
              })
            ).id,
          });

          data = contract.methods.processBid(logs[0].topic1, false).encodeABI();
          console.log("Booked! ------");
        } else {
          //underpayment --refund user and possibly email user of failed purchase attempt
          data = contract.methods.processBid(logs[0].topic1, true).encodeABI();
          // console.log("underpriced");
        }

        //finish tx
        const tx = {
          from: account.address,
          to: toAddress,
          data,
          gasPrice: await web3.eth.getGasPrice(),
        };
        const gas = await web3.eth.estimateGas(tx);
        tx.gas = gas;
        web3.eth
          .sendTransaction(tx)
          .on("transactionHash", (hash) => {
            console.log(`Transaction hash: ${hash}`);
          })
          .on("receipt", async (receipt) => {
            console.log(
              `Transaction was mined in block ${receipt.blockNumber}`
            );
            // res.send(200);
            if (booked) {
              const result = await nfts.buyNft(params, fromAddress);

              const event = await db.notificationEvents.findOne({
                where: {
                  name: "NFTSold",
                },
              });
              const event2 = await db.notificationEvents.findOne({
                where: {
                  name: "SuccessfulPurchase",
                },
              });
              const seller = await db.users.findOne({
                where: {
                  id: result.transaction.sellerId,
                },
              });
              const notification = await db.notifications.create({
                parameters: {
                  transactionId: result.transaction.id,
                  username: seller.username,
                  nft_name: result.transaction.listingInfo.name,
                  price: result.transaction.listingInfo.price,
                  currency: result.transaction.erc20Info.symbol,
                },
                userId: result.transaction.sellerId,
                notificationEventId: event.id,
              });
              //emit to seller

              const notification2 = await db.notifications.create({
                parameters: {
                  transactionId: result.transaction.id,
                  username: result.buyer.username,
                  nft_name: result.transaction.listingInfo.name,
                  price: result.transaction.listingInfo.price,
                  currency: result.transaction.erc20Info.symbol,
                },
                userId: result.buyer.id,
                notificationEventId: event2.id,
              });
            }
          })
          .on("error", (error) => {
            console.error(error);
            // res.send();
            logger(JSON.stringify(error), "piProxy-listing", "error");
          });
      }
    }
  }

  res.send();
});
module.exports = broker;

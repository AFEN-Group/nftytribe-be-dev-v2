const expressAsyncHandler = require("express-async-handler");
const { validationResult, matchedData } = require("express-validator");
const checkError = require("@functions/checkError");
const Nfts = require("@functions/nfts");
const Moralis = require("../functions/Moralis.sdk");
const { createPhysicalItems } = require("@functions/physicalItems");
const {
  // linkPhysicalItems,
  getPhysicalItem,
} = require("../functions/physicalItems");
const db = require("@models");
const { redis } = require("@helpers/redis");
const { logger } = require("@helpers/logger");

const getNfts = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const nfts = await new Nfts().getNfts(req.query, req.params.field);
  res.send(nfts);
});

const getTransactions = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { type, limit, page } = req.query;
  const result =
    type.toLowerCase() === "sold"
      ? await new Nfts().getSold({ page, limit }, req.user.id)
      : await new Nfts().getCollected({ page, limit }, req.user.id);

  res.send(result);
});
const getSingleNftListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.params;
  const { userId } = req.query;
  res.send(await new Nfts().getSingleListing(id, req.user?.id || userId));
});
// const ListNft = expressAsyncHandler(async (req, res) => {
//   await checkError(req, validationResult);
// });
const getListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const options = req.query;
  options.userId = req.user?.id || req.query.userId;
  // console.log(options.userId);
  const result = await new Nfts().getListings(options);
  res.send(result);
});
const watchListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.user;
  const { nftId } = req.params;
  const result = await new Nfts().watchListing(nftId, id);
  res.send(result);
});
const getWatchers = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { nftId } = req.params;
  const result = await new Nfts().getWatchers(nftId, req.query);
  res.send(result);
});
const bidListings = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
});
const getBids = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { nftId } = req.params;
  const bids = await new Nfts().getBids(nftId, req.query);
  res.send(bids);
});
const likeListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.user;
  const result = await new Nfts().likeUnlike(id, req.params.nftId);
  res.send(result);
});
const favoriteListing = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.user;
  const result = await new Nfts().favoriteUnfavorite(id, req.params.nftId);
  res.send(result);
});

const singleWalletNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { tokenId, contractAddress, chain } = req.query;
  const result = await new Nfts().getNftMetaData(
    tokenId,
    contractAddress,
    chain
  );
  res.send(result);
});

const newPhysicalItem = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, { locations: ["body"] });
  const newItem = await createPhysicalItems(data);

  res.send(newItem);
});

const newNft = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, { locations: ["body"] });
  const { image } = req;
  const createNft = await Nfts.createNft(data, image, req.user.username);
  res.send(createNft);
});

const fetchPhysicalItem = expressAsyncHandler(async (req, res) => {
  const item = await getPhysicalItem(req.params.listingId);
  res.send(item);
});

const testT = "0x55d398326f99059fF775485246999027B3197955";
const testChain = "0x38";
const env = process.env.NODE_ENV;

const getTokenPrices = expressAsyncHandler(async (req, res) => {
  // addresses && chainId = req.body -- required fields in body
  const chain = env === "production" ? req.body.chainId : testChain;
  const cachedTokens = await redis.get("supported-token-" + chain);

  const token = await db.supportedTokens.findAll({
    include: {
      model: db.chains,
      where: {
        chain,
      },
      required: true,
    },
  });
  try {
    const data = await Promise.all(
      (env === "production" ? token : [{ token: testT }]).map(
        async ({ token }) => {
          const data = await Moralis.EvmApi.token.getTokenPrice({
            address: token,
            chain,
          });
          return data.toJSON();
        }
      )
    );
    //cache data
    await redis.set("supported-token-" + chain, JSON.stringify(data));
    res.send(data);
  } catch (err) {
    console.log(err);
    logger(err, "supportedTokenError", "error");
    if (cachedTokens) {
      res.send(JSON.parse(cachedTokens));
      console.log("sent cache");
    } else throw err;
  }
});

module.exports = {
  getNfts,
  getSingleNftListing,
  // ListNft,
  getListings,
  watchListings,
  bidListings,
  getBids,
  likeListing,
  favoriteListing,
  getWatchers,
  singleWalletNft,
  getTransactions,
  newPhysicalItem,
  newNft,
  fetchPhysicalItem,
  getTokenPrices,
};

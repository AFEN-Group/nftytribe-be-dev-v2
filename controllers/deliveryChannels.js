const expressAsyncHandler = require("express-async-handler");
const checkError = require("@functions/checkError");
const { validationResult, matchedData } = require("express-validator");
const {
  createDeliveryMethod,
  getDeliveryChannels,
  deleteChannel,
} = require("../functions/deliveryChannels");
const DeliveryMethods = require("../functions/deliveryMethods");
const { redis } = require("@helpers/redis");

exports.createDeliveryChannels = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req, validationResult, {
    matchedData,
    locations: ["body"],
  });
  const { name } = data;
  const result = await createDeliveryMethod(name);
  res.send(result);
});

exports.deleteDeliveryChannel = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const { id } = req.deliveryMethod;
  const data = await deleteChannel(id);
  res.status(204).send(data);
});

exports.getMethods = expressAsyncHandler(async (req, res) => {
  const data = await getDeliveryChannels();
  res.send(data);
});

exports.getMethodsData = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req, validationResult, {
    matchedData,
    locations: ["params", "query"],
  });
  const method = await DeliveryMethods[data.methodName.toLowerCase()];

  if (data.type.toLowerCase() === "cities") {
    res.send(await method.getCities(data.countryCode));
  }
  if (data.type.toLowerCase() === "states") {
    res.send(await method.getStates(data.countryCode));
  }
  if (data.type.toLowerCase() === "countries") {
    res.send(await method.getCountries());
  }
});

exports.getFee = expressAsyncHandler(async (req, res) => {
  const data = await checkError(req, validationResult, {
    matchedData,
    locations: ["body", "params"],
  });
  // console.log(data);
  const fee = await DeliveryMethods[
    data.methodName.toLowerCase()
  ].getDeliveryFee(data.listingId, data);

  //temporarily store the last check a user used in getting delivery cost for future ref
  await redis.setex(
    req.user.walletAddress + process.env.physical_item_buyer_marker,
    60 * 30,
    JSON.stringify({ ...data, ...fee })
  );
  res.send(fee);
});

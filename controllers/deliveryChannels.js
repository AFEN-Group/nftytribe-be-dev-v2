const expressAsyncHandler = require("express-async-handler");
const checkError = require("@functions/checkError");
const { validationResult, matchedData } = require("express-validator");
const {
  createDeliveryMethod,
  getDeliveryChannels,
  deleteChannel,
} = require("../functions/deliveryChannels");
const DeliveryMethods = require("../functions/deliveryMethods");

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

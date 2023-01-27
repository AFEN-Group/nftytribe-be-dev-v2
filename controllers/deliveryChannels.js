const expressAsyncHandler = require("express-async-handler");
const checkError = require("@functions/checkError");
const { validationResult, matchedData } = require("express-validator");
const {
  createDeliveryMethod,
  getDeliveryChannels,
  deleteChannel,
} = require("../functions/deliveryChannels");

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

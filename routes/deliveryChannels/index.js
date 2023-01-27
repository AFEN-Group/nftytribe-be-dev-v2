const {
  createDeliveryChannels,
  getMethods,
  deleteDeliveryChannel,
} = require("../../controllers/deliveryChannels");
const {
  createDeliveryChannelsValidations,
  deleteDeliveryChannelsValidations,
} = require("./validation");
const deliveryChannels = require("express").Router();

deliveryChannels
  .route("/")
  .post(createDeliveryChannelsValidations, createDeliveryChannels)
  .get(getMethods);
deliveryChannels
  .route("/:id")
  .delete(deleteDeliveryChannelsValidations, deleteDeliveryChannel);

module.exports = deliveryChannels;

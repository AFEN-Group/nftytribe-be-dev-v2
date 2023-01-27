const {
  createDeliveryChannels,
  getMethods,
  deleteDeliveryChannel,
  getMethodsData,
} = require("../../controllers/deliveryChannels");
const {
  createDeliveryChannelsValidations,
  deleteDeliveryChannelsValidations,
  getStatesOrCitiesValidations,
} = require("./validation");
const deliveryChannels = require("express").Router();

deliveryChannels
  .route("/methods/:methodName/:type")
  .get(getStatesOrCitiesValidations, getMethodsData);

deliveryChannels
  .route("/")
  .post(createDeliveryChannelsValidations, createDeliveryChannels)
  .get(getMethods);
deliveryChannels
  .route("/:id")
  .delete(deleteDeliveryChannelsValidations, deleteDeliveryChannel);

module.exports = deliveryChannels;

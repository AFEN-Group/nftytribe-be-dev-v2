const db = require("../models");

exports.createDeliveryMethod = async (name) => {
  const channel = await db.deliveryChannels.create({
    name,
  });

  return channel;
};

exports.deleteChannel = async (id) => {
  const deleted = await db.deliveryChannels.destroy({
    where: {
      id,
    },
  });

  return {
    message: "deleted",
    id,
  };
};

exports.getDeliveryChannels = async () => {
  const channels = await db.deliveryChannels.findAll();
  return channels;
};

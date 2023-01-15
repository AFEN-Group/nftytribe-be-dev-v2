const db = require("../models");

exports.createDeliveryChannels = async (name) => {
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

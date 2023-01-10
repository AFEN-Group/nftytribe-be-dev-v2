const deliveryChannels = (sequelize, dataTypes) => {
  const deliveryChannels = sequelize.define("deliveryChannels", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: "name",
    },
  });

  deliveryChannels.associate = (models) => {
    deliveryChannels.hasMany(models.deliveries, { allowNull: true });
  };

  return deliveryChannels;
};

module.exports = deliveryChannels;

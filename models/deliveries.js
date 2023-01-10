const deliveries = (sequelize, dataTypes) => {
  const deliveries = sequelize.define("deliveries", {
    status: {
      type: dataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  deliveries.associate = (models) => {
    deliveries.belongsTo(models.deliveryChannels, {
      foreignKey: {
        allowNull: true,
      },
    });
    deliveries.belongsTo(models.physicalItemBuyers, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return deliveries;
};

module.exports = deliveries;

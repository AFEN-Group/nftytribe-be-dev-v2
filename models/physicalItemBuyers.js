const physicalItemBuyers = (sequelize, dataTypes) => {
  const physicalItemBuyers = sequelize.define("physicalItemBuyers", {
    address: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    charges: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });
  physicalItemBuyers.associate = (models) => {
    physicalItemBuyers.hasMany(models.deliveries, { onDelete: "cascade" });
    physicalItemBuyers.belongsTo(models.physicalItems, {
      foreignKey: { allowNull: true },
    });
    physicalItemBuyers.belongsTo(models.users, { onDelete: "cascade" });
  };
  return physicalItemBuyers;
};

module.exports = physicalItemBuyers;

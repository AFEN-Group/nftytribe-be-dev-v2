const physicalItems = (sequelize, dataTypes) => {
  const physicalItems = sequelize.define("physicalItems", {
    address: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: dataTypes.STRING,
    },
    state: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    tokenId: {
      type: dataTypes.INTEGER,
    },
    tokenAddress: {
      type: dataTypes.STRING,
    },
    weight: {
      type: dataTypes.DECIMAL(10, 2),
    },
  });

  physicalItems.associate = (models) => {
    physicalItems.belongsTo(models.nfts, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
      },
    });
    physicalItems.hasMany(models.physicalItemBuyers, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
      },
    });
  };
  return physicalItems;
};

module.exports = physicalItems;

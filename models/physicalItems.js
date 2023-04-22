const physicalItems = (sequelize, dataTypes) => {
  const physicalItems = sequelize.define("physicalItems", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: dataTypes.TEXT,
    },
    unit_weight: {
      type: dataTypes.INTEGER,
      default: 1,
    },
    unit_amount: {
      type: dataTypes.INTEGER,
      default: 1,
    },
    quantity: {
      type: dataTypes.INTEGER,
      default: 1,
    },
  });

  physicalItems.associate = (models) => {
    physicalItems.belongsTo(models.nfts, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
      },
    });

    // physicalItems.hasOne(models.physicalItemBuyers, {
    //   // onDelete: "cascade",
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // });
    physicalItems.hasMany(models.uploads, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: true,
      },
    });
    physicalItems.belongsTo(models.addresses);
  };
  return physicalItems;
};

module.exports = physicalItems;

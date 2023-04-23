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
    address_code: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },

    height: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },

    width: {
      type: dataTypes.INTEGER,
      allowNull: false,
    },

    length: {
      type: dataTypes.INTEGER,
      allowNull: false,
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
  };
  return physicalItems;
};

module.exports = physicalItems;

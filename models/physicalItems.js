const physicalItems = (sequelize, dataTypes) => {
  const physicalItems = sequelize.define("physicalItems", {
    twitter: {
      type: dataTypes.STRING,
    },
    linkedn: {
      type: dataTypes.STRING,
    },
    artistSignature: {
      type: dataTypes.STRING,
    },
    issuedIdUrl: {
      type: dataTypes.STRING,
    },
  });

  physicalItems.associate = (models) => {
    physicalItems.belongsTo(models.nfts, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    physicalItems.hasMany(models.physicalItemBuyers, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return physicalItems;
};

module.exports = physicalItems;

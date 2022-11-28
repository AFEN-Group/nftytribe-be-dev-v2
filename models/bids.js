const bids = (sequelize, dataTypes) => {
  const bids = sequelize.define("bids", {
    amount: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });
  bids.associate = (model) => {
    bids.belongsTo(model.nfts, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    bids.belongsTo(model.users, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return bids;
};

module.exports = bids;

const listingWatchers = (sequelize, dataTypes) => {
  const listingWatchers = sequelize.define("listingWatchers", {});

  listingWatchers.associate = (model) => {
    listingWatchers.belongsTo(model.users, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    listingWatchers.belongsTo(model.nfts, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return listingWatchers;
};

module.exports = listingWatchers;

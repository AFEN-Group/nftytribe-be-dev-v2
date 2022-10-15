const collectionFavorites = (sequelize, dataTypes) => {
  const collectionFavorites = sequelize.define("collectionFavorites", {});
  collectionFavorites.associate = (models) => {
    collectionFavorites.belongsTo(models.users, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    collectionFavorites.belongsTo(models.collections, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return collectionFavorites;
};

module.exports = collectionFavorites;

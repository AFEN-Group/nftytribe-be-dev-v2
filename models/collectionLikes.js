const collectionLikes = (sequelize, dataTypes) => {
  const collectionLikes = sequelize.define("collectionLikes", {});
  collectionLikes.associate = (models) => {
    collectionLikes.belongsTo(models.users);
    collectionLikes.belongsTo(models.collections);
  };

  return collectionLikes;
};

module.exports = collectionLikes;

const nftFavorites = (sequelize, dataTypes) => {
    const nftFavorites = sequelize.define("nftFavorites", {});
    nftFavorites.associate = (models) => {
      nftFavorites.belongsTo(models.users);
      nftFavorites.belongsTo(models.nfts);
    };
  
    return nftFavorites;
  };
  
  module.exports = nftFavorites;
  
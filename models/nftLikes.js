const nftLikes = (sequelize, dataTypes) => {
    const nftLikes = sequelize.define("nftLikes", {});
    nftLikes.associate = (models) => {
      nftLikes.belongsTo(models.users);
      nftLikes.belongsTo(models.nfts);
    };
  
    return nftLikes;
  };
  
  module.exports = nftLikes;
  
const collections = (sequelize, dataTypes) => {
  const collections = sequelize.define("collections", {
    name: {
      allowNull: true,
      type: dataTypes.STRING,
    },
    contractAddress: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "contractAddress",
    },
    coverImage: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "coverImage",
      validate: {
        isUrl: true,
      },
    },
    referWalletAddress: {
      allowNull: true,
      type: dataTypes.STRING,
    },
  });
  collections.associate = (models) => {
    collections.belongsTo(models.users);
    collections.belongsTo(models.chains, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    collections.hasMany(models.collectionLikes, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    collections.hasMany(models.collectionFavorites, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return collections;
};

module.exports = collections;

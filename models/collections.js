const collections = (sequelize, dataTypes) => {
  const collections = sequelize.define("collections", {
    name: {
      allowNull: false,
      type: dataTypes.STRING,
    },
    symbol: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    contractAddress: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "contractAddress",
    },
    contractType: {
      allowNull: false,
      type: dataTypes.STRING,
    },
    coverImage: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "coverImage",
      validate: {
        isUrl: true,
      },
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

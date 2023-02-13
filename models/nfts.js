const { DataTypes, Sequelize } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 * @returns
 */
const nfts = (sequelize, dataTypes) => {
  const nfts = sequelize.define("nfts", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    tokenId: {
      allowNull: true,
      type: dataTypes.INTEGER,
    },
    royalty: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    physical: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    description: {
      type: dataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    lazyMint: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    price: {
      type: dataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    listingType: {
      type: dataTypes.ENUM("AUCTION", "NORMAL"),
      allowNull: false,
      defaultValue: "NORMAL",
    },
    timeout: {
      type: dataTypes.DATE,
      allowNull: true,
    },
    moreInfo: {
      type: dataTypes.JSON,
      allowNull: true,
    },
    confirmed: {
      type: dataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    amount: {
      type: dataTypes.INTEGER,
      defaultValue: 1,
    },
  });

  nfts.associate = (models) => {
    nfts.hasMany(models.nftLikes, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    nfts.hasMany(models.nftFavorites, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    nfts.hasMany(models.bids, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    nfts.hasMany(models.listingWatchers, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });

    nfts.belongsTo(models.collections);
    nfts.belongsTo(models.chains);
    nfts.belongsTo(models.users, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
    nfts.belongsTo(models.categories);
    nfts.hasOne(models.physicalItems, {
      foreignKey: {
        allowNull: false,
      },
      onDelete: "cascade",
    });
  };
  return nfts;
};

module.exports = nfts;

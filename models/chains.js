const chains = (sequelize, dataTypes) => {
  const chains = sequelize.define("chains", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: "name",
    },
    chain: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "chain",
    },
    rpc: {
      allowNull: true,
      type: dataTypes.STRING,
    },
    image: {
      allowNull: true,
      type: dataTypes.STRING,
    },
  });
  chains.associate = (models) => {
    chains.hasMany(models.collections, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    chains.hasMany(models.nfts, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
    chains.hasMany(models.transactions, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
        // default: 1,
      },
    });
  };
  return chains;
};

module.exports = chains;

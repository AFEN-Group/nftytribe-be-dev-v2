const chains = (sequelize, dataTypes) => {
  const chains = sequelize.define("chains", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
      unique: "name",
    },
    symbol: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "symbol",
    },
  });
  chains.associate = (models) => {
    chains.hasMany(models.collections, {
      onDelete: "cascade",
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return chains;
};

module.exports = chains;

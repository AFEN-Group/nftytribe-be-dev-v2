const categories = (sequelize, dataTypes) => {
  const categories = sequelize.define("categories", {
    name: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "name",
    },
  });
  categories.associate = (models) => {
    categories.hasMany(models.nfts)
  };
  return categories
};

module.exports = categories;

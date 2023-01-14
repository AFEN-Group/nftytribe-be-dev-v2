const { Sequelize, DataTypes } = require("sequelize");

const uploads = (sequelize, dataTypes) => {
  const uploads = sequelize.define("uploads", {
    id: {
      type: Sequelize.UUID,
      unique: "id",
      primaryKey: true,
      autoIncrement: false,
      defaultValue: DataTypes.UUIDV4,
    },
    url: {
      allowNull: false,
      type: dataTypes.STRING,
      defaultValue: process.env.default_uploads,
      validate: {
        isUrl: true,
      },
    },
  });
  uploads.associate = (models) => {
    uploads.belongsTo(models.physicalItems, {
      onDelete: "cascade",
    });
  };
  return uploads;
};

module.exports = uploads;

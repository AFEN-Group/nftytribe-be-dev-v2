const { Sequelize } = require("sequelize");

/**
 *
 * @param {Sequelize} sequelize - sequelize instance
 * @param {import("sequelize").DataTypes} dataTypes - DataType instance
 */
const Config = (sequelize, dataTypes) => {
  const Config = sequelize.define(
    "config",
    {
      name: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: "name",
      },
      value: {
        type: dataTypes.TEXT,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  return Config;
};

module.exports = Config;

const { Sequelize, DataTypes } = require("sequelize");
/**
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} dataTypes
 */
const emailTemplates = (sequelize, dataTypes) => {
  const emailTemplates = sequelize.define("emailTemplates", {
    name: {
      type: dataTypes.STRING(32),
      allowNull: false,
    },
    html: {
      type: dataTypes.TEXT,
      allowNull: false,
    },
  });
  //   emailTemplates.sayHello = (stuff) => console.log(stuff);
  emailTemplates.getAndSetValues = async (name, values = {}) => {
    const { html } = await emailTemplates.findOne({
      where: {
        name,
      },
    });
    const keys = Object.entries(values);
    let string = html;
    keys.forEach(([field, value]) => {
      string = string.replace(`**${field}**`, value);
    });
    return string;
  };
  return emailTemplates;
};

module.exports = emailTemplates;

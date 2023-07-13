const emailLists = (sequelize, dataTypes) => {
  const emailLists = sequelize.define("emailLists", {
    email: {
      allowNull: false,
      type: dataTypes.STRING,
      unique: "email",
      // defaultValue: process.env.default_emailLists,
      validate: {
        isEmail: true,
      },
    },
    firstName: {
      // allowNull: false,
      type: dataTypes.STRING,
      // defaultValue: process.env.default_emailLists,
    },
    lastName: {
      // allowNull: false,
      type: dataTypes.STRING,
      // defaultValue: process.env.default_emailLists,
    },
  });
  emailLists.associate = (models) => {};
  return emailLists;
};

module.exports = emailLists;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("addresses", {
      fields: ["userId"],
      type: "unique",
      name: "addresses_userId",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("addresses", "addresses_userId");
  },
};

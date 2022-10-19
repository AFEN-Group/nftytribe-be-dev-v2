const { body, param } = require("express-validator");
const db = require("../../models");
const addCategoryValidations = [
  body("name")
    .not()
    .isEmpty()
    .escape()
    .trim()
    .isString()
    .custom(async (name) => {
      const cat = await db.categories.findOne({ where: { name } });
      if (cat) throw "Category name already exists!";
      return true;
    }),
];

const removeCategoryValidations = [
  param("id")
    .not()
    .isEmpty()
    .toInt()
    .custom(async (id) => {
      const cat = await db.categories.findOne({ where: { id } });
      if (!cat) throw "Category does not exist";
    }),
];

module.exports = {
  addCategoryValidations,
  removeCategoryValidations,
};

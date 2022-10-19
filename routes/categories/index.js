const {
  getCategories,
  addCategory,
  removeCategory,
} = require("../../controllers/categories");
const {
  addCategoryValidations,
  removeCategoryValidations,
} = require("./validations");

const categories = require("express").Router();

categories
  .route("/")
  .get(getCategories)
  .post(addCategoryValidations, addCategory);

categories.route("/:id").delete(removeCategoryValidations, removeCategory);

module.exports = categories;

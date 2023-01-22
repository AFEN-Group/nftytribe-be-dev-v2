const expressAsyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const Category = require("functions/categories");
const checkError = require("functions/checkError");
const category = new Category();

const addCategory = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await category.addCategory(req.body.name);
  res.send(result);
});

const getCategories = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await category.getCategories();
  res.send(result);
});

const removeCategory = expressAsyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await category.removeCategory(req.params.id);
  res.send(result);
});

module.exports = {
  addCategory,
  getCategories,
  removeCategory,
};

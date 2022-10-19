const db = require("../models");

class Category {
  addCategory = async (name) => {
    const category = await db.categories.create({ name });
    return category;
  };

  removeCategory = async (id) => {
    await db.categories.destroy({ where: { id } });
    return {
      message: "success",
      categoryId: id,
    };
  };

  getCategories = async () => {
    const categories = await db.categories.findAll();
    return categories;
  };
}

module.exports = Category;

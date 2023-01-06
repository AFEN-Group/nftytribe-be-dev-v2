const db = require("../models");

class Stats {
  getCollectionStats = async (data = {}) => {
    const { startDate, endDate, limit, page } = data;
    //get collection with highest buy based on date
    const options = {};
    const includes = [];

    const collections = await db.collections.findAll({
      where: options,
      includes,
    });
  };
}

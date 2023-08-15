const checkError = require("@functions/checkError");
const db = require("@models");
const expressAsyncHandler = require("express-async-handler");
const { Op } = require("sequelize");

exports.generalSearch = expressAsyncHandler(async (req, res) => {
  const { searchQuery, page, limit: pageSize } = await checkError(req);

  const users = {};
  const listings = {};

  const { rows: usersResult, count: totalUsers } =
    await db.users.findAndCountAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${searchQuery}%` } },
          { username: { [Op.like]: `%${searchQuery}%` } },
          { bio: { [Op.like]: `%${searchQuery}%` } },
          { twitter: { [Op.like]: `%${searchQuery}%` } },
          { website: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

  const { rows: nftsResults, count: totalNfts } = await db.nfts.findAndCountAll(
    {
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
          { url: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }
  );

  users.results = usersResult;
  users.totalPages = Math.ceil(totalUsers / pageSize);
  users.page = page;

  //

  listings.results = nftsResults;
  listings.totalPages = Math.ceil(totalNfts / pageSize);
  listings.page = page;

  res.send({ users, listings });
});

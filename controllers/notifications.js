const checkError = require("@functions/checkError");
const db = require("@models");
const expressAsyncHandler = require("express-async-handler");
const { Op } = require("sequelize");

exports.getNotification = expressAsyncHandler(async (req, res) => {
  await checkError(req);
  const { id } = req.user;
  const { limit, page } = req.query;
  //   console.log(limit, id, page);
  const user = await db.users.findOne({
    where: {
      id,
    },
  });
  const offset = (page - 1) * limit;
  const [total, notification] = await Promise.all([
    await user.countNotifications(),
    await user.getNotifications({
      limit,
      offset,
      include: {
        model: db.notificationEvents,
      },
    }),
  ]);
  const data = {
    results: notification,
    totalPages: Math.ceil(total / limit),
    limit,
    page,
    totalNotifications: total,
  };

  res.send(data);
});

exports.markAll = expressAsyncHandler(async (req, res) => {
  const { id } = req.user;
  //   const { notificationId } = req.query;

  await db.notifications.update(
    { isRead: true },
    {
      where: {
        id: {
          [Op.in]: db.Sequelize.literal(`(
          SELECT notificationId FROM userNotifications WHERE userId = ${id})`),
        },
      },
    }
  );

  res.send();
});

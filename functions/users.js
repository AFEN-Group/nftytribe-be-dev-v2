const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
class Users {
  constructor(userId) {
    this.userId = userId;
  }
  createAccount = async (walletAddress) => {
    const t = await db.sequelize.transaction();
    try {
      const newUser = await db.users.create(
        {
          walletAddress,
        },
        { transaction: t }
      );
      newUser.addAvatar({}, { transaction: t });
      await t.commit();
      return await this.getUser(newUser.id);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  };
  getUser = async (field, t) => {
    const user = await db.users.findOne({
      where: {
        [Op.or]: [
          { username: field },
          { id: field },
          { walletAddress: field },
          { email: field },
        ],
      },
      transaction: t,
    });
    if (!user)
      throw {
        message: "user not found",
        status: 404,
      };
    return user;
  };
  loginUser = async (walletAddress) => {
    const key = process.env.jwt_key;
    const user = await this.getUser(walletAddress);
    const { id, username, email } = user;
    const token = jwt.sign(
      {
        id,
        username,
        email,
      },
      key,
      {
        expiresIn: 24 * 30 + "h",
      }
    );
    return token;
  };
  updateUser = async (id, data, url) => {
    const t = await db.sequelize.transaction();
    try {
      await db.users.update(data, {
        where: {
          id,
        },
        transaction: t,
      });
      if (url) {
        await db.avatar.update(
          { url },
          {
            where: {
              userId: id,
            },
            transaction: t,
          }
        );
      }
      const updatedUser = await this.getUser(id, t);
      await t.commit();
      return updatedUser;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  };
}

module.exports = Users;

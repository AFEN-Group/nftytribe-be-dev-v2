const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const rs = require("randomstring");
const Mailer = require("./mailer");
const otpVerification = require("../email_templates/emailVerification");
const db = require("../models");

class Users {
  constructor(userId) {
    this.userId = userId;
  }
  createAccount = async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const newUser = await db.users.create(data, { transaction: t });
      await newUser.createAvatar({}, { transaction: t });
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
      include: [
        {
          model: db.avatar,
        },
      ],
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
    return { token };
  };
  updateUser = async (data, id = this.userId, url) => {
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
      await t.commit();
      const updatedUser = await this.getUser(id);
      return updatedUser;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  };

  addEmail = async (email) => {
    const token = rs.generate(6);
    await db.emailVerifications.upsert({
      token,
      email,
      userId: this.userId,
    });
    const response = await new Mailer("verify", "Nftytribe.io").sendEmail({
      subject: "Email Verification",
      html: otpVerification(token),
      to: [email],
    });
    console.log(response[0]);
    return {
      message: "An otp has been sent to email for verification",
      email,
      token,
    };
  };

  verifyEmail = async (token) => {
    const email = await db.emailVerifications.findOne({
      where: {
        userId: this.userId,
        token,
      },
    });
    if (!email)
      throw {
        message: "email not found",
      };
    const { updatedAt } = email;
    const expiry = new Date(updatedAt).setMinutes(
      new Date(updatedAt).getMinutes() +
        Number(process.env.email_verification_expiry)
    );
    if (Date.now() > expiry)
      throw {
        message: "token expired",
        status: 401,
      };
    await db.emailVerifications.destroy({
      where: {
        token,
        userId: this.userId,
      },
    });
    const updated = await this.updateUser({ email: email.email });
    return updated;
  };
}

module.exports = Users;

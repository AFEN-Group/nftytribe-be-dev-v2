const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const rs = require("randomstring");
const Mailer = require("./mailer");
const db = require("../models");
const { redis } = require("@helpers/redis");

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
    const exp = process.env.email_ver_exp || 1200;
    await redis.setex(
      this.userId + "-email-verification",
      exp,
      JSON.stringify({ token, email })
    );

    // await db.emailVerifications.upsert({
    //   token,
    //   email,
    //   userId: this.userId,
    // });

    const htmlEmail = await db.emailTemplates.getAndSetValues(
      "emailVerification",
      { code: token }
    );
    const response = await new Mailer("verify", "Nftytribe.io").sendEmail({
      subject: "Email Verification",
      html: htmlEmail,
      to: [email],
    });
    // console.log(response[0]);
    return {
      message: "An otp has been sent to email for verification",
      email,
      token,
    };
  };

  verifyEmail = async (token) => {
    let email = await redis.get(this.userId + "-email-verification");
    if (!email)
      throw {
        message: "email not found",
      };

    email = JSON.parse(email);

    if (email.token !== token)
      throw {
        message: "Invalid or expired token!",
      };
    await redis.del(this.userId + "-email-verification");
    const updated = await this.updateUser({ email: email.email });
    await db.emailLists.create({
      email: email.email,
    });
    return updated;
  };
}

module.exports = Users;

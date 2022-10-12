const { body, param } = require("express-validator");
const rs = require("randomstring");
const createUserValidation = [
  body("username")
    .trim()
    .escape()
    .default(`user-${rs.generate(5)}`),
  body("walletAddress")
    .not()
    .isEmpty()
    .trim()
    .custom(async (value) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw "invalid wallet address";
      }
      return true;
    }),
];

const loginValidation = [
  body("walletAddress")
    .not()
    .isEmpty()
    .trim()
    .custom((value) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        throw "invalid wallet address";
      }
      return true;
    }),
];

const userUpdateValidation = [
  body("username")
    .not()
    .isEmpty()
    .trim()
    .custom(async (username) => {
      const user = await db.users.findOne({
        where: {
          username,
        },
      });
      if (user) throw "username already exists";
      return true;
    }),
  body("twitter").isURL().optional({ checkFalsy: true }),
  body("website").isURL().optional({ checkFalsy: true }),
  body("bio").isString().optional({ checkFalsy: true }),
];

const addEmailValidation = [body("email").isEmail()];

const verifyEmailValidation = [body("token").not().isEmpty().trim()];
module.exports = {
  createUserValidation,
  loginValidation,
  addEmailValidation,
  verifyEmailValidation,
  userUpdateValidation,
};

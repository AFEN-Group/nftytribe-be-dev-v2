const { body, param } = require("express-validator");
const rs = require("randomstring");
const db = require("../../models");
const multer = require("multer");
const createUserValidation = [
  body("username")
    .trim()
    .escape()
    .customSanitizer((value) => {
      return "user-" + rs.generate(8);
    }),
  body("walletAddress")
    .not()
    .isEmpty()
    .trim()
    .custom(async (walletAddress) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw "invalid wallet address";
      }
      const user = await db.users.findOne({ where: { walletAddress } });
      if (user) throw "user with wallet address already exists";
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
    .optional()
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

  body("twitter").isURL().optional({ checkFalsy: false }),
  body("website").isURL().optional({ checkFalsy: false }),
  body("bio").not().isEmpty().optional({ checkFalsy: false }),
];

const addEmailValidation = [
  body("email")
    .isEmail()
    .custom(async (email) => {
      const user = await db.users.findOne({ where: { email } });
      if (user) throw "Email is already associated with a user";
      return true;
    }),
];

const verifyEmailValidation = [body("token").not().isEmpty().trim()];

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8e6,
  },
});

const userVerificationValidation = [
  body(["fullName", "email", "phoneNumber"]).not().isEmpty().isString(),
  body("phoneNumber").isMobilePhone(),
  body("email").isEmail().normalizeEmail(),
  body(["professionalName", "referralCode"])
    .optional({ checkFalsy: true })
    .isString(),
  body("socialMediaLinks").optional().isArray({ min: 0, max: 3 }),
];

module.exports = {
  createUserValidation,
  loginValidation,
  addEmailValidation,
  verifyEmailValidation,
  userUpdateValidation,
  avatarUpload,
  userVerificationValidation,
};

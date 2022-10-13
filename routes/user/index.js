const {
  getUser,
  register,
  login,
  updateUser,
  addEmail,
  verifyEmail,
} = require("../../controllers/users");
const userProtect = require("../../middlewares/userProtect.middleware");
const {
  createUserValidation,
  loginValidation,
  userUpdateValidation,
  addEmailValidation,
  verifyEmailValidation,
  avatarUpload,
} = require("./validations");

const user = require("express").Router();

user.route("/:field").get(getUser);
user
  .route("/:field")
  .patch(
    userProtect,
    avatarUpload.single("avatar"),
    userUpdateValidation,
    updateUser
  );
user.route("/signup").post(createUserValidation, register);
user.route("/login").post(loginValidation, login);
user.route("/email").post(userProtect, addEmailValidation, addEmail);
user
  .route("/email/verify")
  .post(userProtect, verifyEmailValidation, verifyEmail);

module.exports = user;

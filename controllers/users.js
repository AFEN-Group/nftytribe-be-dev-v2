const asyncHandler = require("express-async-handler");
const { validationResult, matchedData } = require("express-validator");
const checkError = require("$functions/checkError");
const Uploads = require("$functions/uploads");
const Users = require("$functions/users");

const register = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, { locations: ["body"] });
  const newUser = await new Users().createAccount(data);
  res.send(newUser);
});

const login = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const token = await new Users().loginUser(req.body.walletAddress);
  res.send(token);
});

const addEmail = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Users(req.user.id).addEmail(req.body.email);
  res.send(result);
});

const verifyEmail = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const result = await new Users(req.user.id).verifyEmail(req.body.token);
  res.send(result);
});

const updateUser = asyncHandler(async (req, res) => {
  await checkError(req, validationResult);
  const data = matchedData(req, {
    includeOptionals: true,
    locations: ["body"],
  });
  let url;
  if (req.file) {
    url = await new Uploads(req.user.id).uploadAvatar([req.file.buffer]);
  }
  const updated = await new Users().updateUser(data, req.user.id, url);
  res.send(updated);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await new Users().getUser(req.params.field);
  res.send(user);
});

module.exports = {
  register,
  login,
  addEmail,
  getUser,
  verifyEmail,
  updateUser,
};

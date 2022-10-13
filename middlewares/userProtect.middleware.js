const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const userProtect = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw {
      code: 401,
      message: "No token found!",
    };
  }
  if (!authorization.toLocaleLowerCase().includes("bearer")) {
    throw {
      code: 401,
      message: "invalid authorization headers",
    };
  }
  const user = jwt.verify(authorization.split(" ")[1], process.env.jwt_key);
  req.user = user;

  //add checks for if user blocked
  next();
});

module.exports = userProtect;

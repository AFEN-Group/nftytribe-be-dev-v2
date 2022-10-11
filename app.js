require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
});

const app = express();
app.use(limiter);
app.use(helmet());
app.disable("x-powered-by");

const server = http.createServer(app);

module.exports = server;

const express = require("express");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const route = require("./routes");
const cors = require("cors");
const errorHandler = require("./middlewares/errorhandler.middleware");
const hooks = require("./webhooks");
const { startSocket } = require("./helpers/socket");

// const logger = require("morgan");

const test = require("@routes/test");

// const init = require("./admin");
const db = require("@models");
const session = require("express-session");
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  standardHeaders: false,
  legacyHeaders: false,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        imgSrc: ["'self'", "https:"],
      },
    },
  })
);
app.disable("x-powered-by");

app.use("/api", route);
app.use("/hook", hooks);
app.use("/test", test);
app.use("/static", express.static("./assets"));
//error handler

const start = async () => {
  const MySQLStore = require("express-mysql-session")(session);
  const { default: init } = await import("./admin/index.mjs");
  await init(app, db, MySQLStore);

  app.use(errorHandler);
  const server = http.createServer(app);
  startSocket(server);

  return server;
};
module.exports = start;

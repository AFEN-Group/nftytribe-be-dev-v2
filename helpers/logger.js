const winston = require("winston");
const moment = require("moment");
exports.logger = (data, filename = "error.log", level = "info") => {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "staging"
  ) {
    const log = winston.createLogger({
      format: winston.format.simple(),
      transports: [new winston.transports.Console()],
    });
    log.log(level, data);
    return;
  }

  const log = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.File({
        filename: `../logs/internal-${filename}-${moment().format(
          "DD-MM-YYYY"
        )}`,
      }),
    ],
  });

  log.log(level, data);
};

exports.emailLogger = (message, filename = "email-logs", level = "info") => {
  const log = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `../logs/${filename}` }),
    ],
  });

  log.log(level, message);
};

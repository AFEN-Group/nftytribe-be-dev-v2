const winston = require("winston");

exports.logger = (data, filename = "error.log", level = "info") => {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "staging"
  ) {
    const log = winston.createLogger({
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console({ filename: `../logs/${filename}` }),
      ],
    });
    log.log(level, data);
    return;
  }

  const log = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `../logs/internal-${filename}` }),
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

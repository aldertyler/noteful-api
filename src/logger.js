const winston = require("winston");
const { NODE_ENV } = require("./config");

const logger = winston.createLogger({
  // log everything with a severity of info and greater
  level: "debug",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })],
});

if (!["test"].includes(NODE_ENV)) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;

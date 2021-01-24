require("express-async-errors");
const winston = require("winston");
// require("winston-mongodb");
const morgan = require("morgan");

module.exports = function (app) {
  winston.add(
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      handleExceptions: true,
      handleRejections: true,
    })
  );
  winston.add(
    new winston.transports.File({
      filename: "logfile.log",
      handleExceptions: true,
      handleRejections: true,
    })
  );
  // winston.add(new winston.transports.MongoDB({ db: config.get("db") }));

  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
    winston.info("Morgan is enabled...");
  }
};

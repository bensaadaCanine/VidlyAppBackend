const winston = require("winston");

module.exports = function (err, req, res, next) {
  //Log the error in the server
  winston.error(err.message);

  res.status(500).send("Something failed.");
};

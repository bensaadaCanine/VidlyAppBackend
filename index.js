const express = require("express");
const app = express();
const winston = require("winston");

require("./startup/routes")(app);
require("./startup/database")();
require("./startup/logging")(app);
require("./startup/config")();

//require("./startup/prod")(app);
app.get("/", (req, res) => res.send("WELCOME TO VIDLY"));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  winston.info("Listening on port " + PORT)
);
module.exports = server;

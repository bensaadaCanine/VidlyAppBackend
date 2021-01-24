const express = require("express");
const auth = require("../routs/auth");
const error = require("../middleware/error");
const genres = require("../routs/genres");
const customers = require("../routs/customers");
const movies = require("../routs/movies");
const rentals = require("../routs/rentals");
const users = require("../routs/users");
const returns = require("../routs/returns");
const cors = require("cors");
const config = require("config");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/returns", returns);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use(error);
};

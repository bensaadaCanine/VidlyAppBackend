const express = require("express");
const mongoose = require("mongoose");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();
const auth = require("../middleware/auth");
const validateReq = require("../middleware/validateReq");

router.get("/", auth, async (req, res) => {
  const result = await Rental.find({}).sort("-__v");
  res.send(result);
});

router.post("/", [auth, validateReq(validate)], async (req, res) => {
  const movie = await Movie.findById(req.body.movieID);
  if (!movie) return res.status(400).send("Invalid movie ID");

  const customer = await Customer.findById(req.body.customerID);
  if (!customer) return res.status(400).send("Invalid customer ID");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie's not in stock!");

  const rental = new Rental({
    movie: {
      _id: movie._id,
      numberInStock: movie.numberInStock,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
  });
  await rental.save();
  movie.numberInStock--;
  await movie.save();
  res.send(rental);
});

module.exports = router;

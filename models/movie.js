const mongoose = require("mongoose");
const { genreSchema } = require("../models/genre");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 50 },

  genre: {
    type: genreSchema,
    required: true,
  },

  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },

  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const result = Joi.object({
    title: Joi.string().min(3).max(50).trim().required(),
    genreID: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
    liked: Joi.boolean(),
  });

  return result.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;
exports.movieSchema = movieSchema;

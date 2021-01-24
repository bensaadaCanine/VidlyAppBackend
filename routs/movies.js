const { Genre } = require("../models/genre");
const { Movie, validate } = require("../models/movie");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validateReq = require("../middleware/validateReq");
const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");

router.get("/", async (req, res) => {
  const result = await Movie.find({}, { __v: 0 }).sort("title");
  res.send(result);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id).select("-__v");
  if (!movie) return res.status(404).send(`Movie ID wasn't found`);
  res.send(movie);
});

router.post("/", [auth, validateReq(validate)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreID);
  if (!genre) return res.status(400).send(`Invalid Genre ID`);

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    liked: req.body.liked,
  });
  await movie.save();
  res.send(movie);
});

router.put(
  "/:id",
  [auth, validateObjectId, validateReq(validate)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreID);
    if (!genre) return res.status(400).send(`Invalid genre ID`);

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
      {
        new: true,
      }
    );

    if (!movie) return res.status(404).send(`Movie wasn't found`);

    res.send(movie);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie)
    return res.status(404).send("Movie ID wasn't found in the server");

  res.send(movie);
});

module.exports = router;

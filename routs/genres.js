const express = require("express");
const router = express.Router();
const { Genre, validate } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const validateReq = require("../middleware/validateReq");

router.get("/", async (req, res) => {
  const result = await Genre.find({}, { __v: 0 }).sort("name");
  res.send(result);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const gen = await Genre.findById(req.params.id).select("-__v");
  if (!gen) return res.status(404).send(`Genre ID wasn't found`);
  res.send(gen);
});

router.post("/", [auth, validateReq(validate)], async (req, res) => {
  const check = await Genre.findOne(req.body);
  if (check) return res.status(400).send("Genre already exists!");

  const genre = new Genre({ name: req.body.name });
  await genre.save();
  res.send(genre);
});

router.put("/:id", [auth, validateReq(validate)], async (req, res) => {
  const gen = await Genre.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!gen) return res.status(404).send(`Genre ID wasn't found`);

  res.send(gen);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const gen = await Genre.findByIdAndDelete(req.params.id);

  if (!gen) return res.status(404).send("Genre already deleted");

  res.send(gen);
});

module.exports = router;

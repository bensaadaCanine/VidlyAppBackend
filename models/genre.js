const Joi = require("joi");
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 15,
    required: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function genreValidation(value) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(15).required(),
  });
  return schema.validate(value);
}

exports.Genre = Genre;
exports.validate = genreValidation;
exports.genreSchema = genreSchema;

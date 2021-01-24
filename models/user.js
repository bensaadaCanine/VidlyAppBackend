const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 255,
    unique: true,
  },
  password: { type: String, required: true, minlength: 8, maxlength: 1024 },
  isAdmin: { type: Boolean, default: false },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      isAdmin: this.isAdmin,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function userValidation(user) {
  const result = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().trim().email().min(10).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
    isAdmin: Joi.boolean(),
  });

  return result.validate(user);
}

exports.User = User;
exports.userSchema = userSchema;
exports.validate = userValidation;

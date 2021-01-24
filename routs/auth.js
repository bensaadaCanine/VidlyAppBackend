const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const _ = require("lodash");
const Joi = require("joi");
const validateReq = require("../middleware/validateReq");

router.post("/", validateReq(validate), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send(`Invalid Email or Password`);

  const checkPassword = await bcrypt.compare(req.body.password, user.password);
  if (!checkPassword) return res.status(400).send(`Invalid Email or Password`);

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
  const result = Joi.object({
    email: Joi.string().trim().email().min(10).max(255).required(),
    password: Joi.string().min(8).max(1024).required(),
  });

  return result.validate(req);
}

module.exports = router;

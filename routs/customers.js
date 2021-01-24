const express = require("express");
const router = express.Router();
const { Customer, validate } = require("../models/customer");
const auth = require("../middleware/auth");
const validateReq = require("../middleware/validateReq");
const validateObjectId = require("../middleware/validateObjectId");
const admin = require("../middleware/admin");

router.get("/", auth, async (req, res) => {
  const result = await Customer.find({}, { __v: 0 }).sort("name");
  res.send(result);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const customer = await Customer.findById(req.params.id).select("-__v");

  if (!customer) return res.status(404).send(`Given customer ID wasn't found.`);
  else res.send(customer);
});

router.post("/", [auth, validateReq(validate)], async (req, res) => {
  let check = await Customer.findOne({ name: req.body.name });
  if (check)
    return res.status(400).send(`Customer already exists in the system!`);

  const result = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });
  await result.save();
  res.send(result);
});

router.put(
  "/:id",
  [auth, validateObjectId, validateReq(validate)],
  async (req, res) => {
    let customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) return res.status(404).send(`Customer ID wasn't found`);

    res.send(customer);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send("Customer wasn't found in th db");

  res.send(customer);
});

module.exports = router;

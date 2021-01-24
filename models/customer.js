const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  phone: { type: String, required: true, minlength: 10, maxlength: 10 },
  isGold: { type: Boolean, default: false },
});

const Customer = mongoose.model("Customer", customerSchema);

function customerValidation(customer) {
  const result = Joi.object({
    name: Joi.string().min(3).required(),
    phone: Joi.string()
      .trim()
      .regex(/^[0-9]+$/)
      .min(10)
      .max(10)
      .required(),
    isGold: Joi.boolean(),
  });

  return result.validate(customer);
}

exports.Customer = Customer;
exports.validate = customerValidation;
exports.customerSchema = customerSchema;

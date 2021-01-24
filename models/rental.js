const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { differenceInDays } = require("date-fns");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true,
      },
      isGold: {
        type: Boolean,
        required: true,
        default: false,
      },
    }),
    required: true,
  },

  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        minlength: 5,
        maxlength: 50,
        trim: true,
        required: true,
      },
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 256,
        required: true,
      },
      numberInStock: {
        type: Number,
        min: 0,
        max: 256,
        required: true,
      },
    }),
    required: true,
  },
  dateOfRental: {
    type: Date,
    required: true,
    default: new Date(),
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

rentalSchema.statics.lookUp = function (customerID, movieID) {
  return this.findOne({
    "customer._id": customerID,
    "movie._id": movieID,
  });
};

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();
  const daysOfRental = differenceInDays(this.dateReturned, this.dateOfRental);
  this.rentalFee = daysOfRental * this.movie.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const result = Joi.object({
    movieID: Joi.objectId().required(),
    customerID: Joi.objectId().required(),
  });

  return result.validate(rental);
}

exports.validate = validateRental;
exports.Rental = Rental;

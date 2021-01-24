const express = require("express");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const validateReq = require("../middleware/validateReq");
const router = express.Router();

router.post("/", [auth, validateReq(validate)], async (req, res) => {
  const rental = await Rental.lookUp(req.body.customerID, req.body.movieID);

  if (!rental)
    return res.status(404).send("No rental was found for this customer/movie");
  if (rental.dateReturned)
    return res.status(400).send("This rental already processed");

  rental.return();
  await rental.save();

  const movie = await Movie.findById(rental.movie._id);
  movie.numberInStock++;
  await movie.save();

  return res.send(rental);
});

module.exports = router;

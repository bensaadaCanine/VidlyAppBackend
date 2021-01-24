const mongoose = require("mongoose");
const request = require("supertest");
const { subDays } = require("date-fns");
const { User } = require("../../models/user");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");

describe("/api/returns", () => {
  let server;
  let rental;
  let customerID;
  let movieID;
  let token;
  let movie;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ movieID, customerID });
  };

  beforeEach(async () => {
    server = require("../../index");

    token = new User().generateAuthToken();

    customerID = mongoose.Types.ObjectId().toHexString();
    movieID = mongoose.Types.ObjectId().toHexString();

    movie = new Movie({
      _id: movieID,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 3,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerID,
        name: "123",
        phone: "1234567890",
      },
      movie: {
        _id: movieID,
        title: "12345",
        dailyRentalRate: 2,
        numberInStock: 3,
      },
    });
    await rental.save();
  });
  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await server.close();
  });
  it("should return 401 if client's not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });
  it("should return 400 if customerID isn't provided", async () => {
    customerID = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });
  it("should return 400 if movieID isn't provided", async () => {
    movieID = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });
  it("should return 404 if rental wasn't found for this customer/movie", async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });
  it("should return 400 if rental already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });
  it("should return 200 if the request is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
  it("should set the return date", async () => {
    await exec();
    const res = await Rental.findById(rental._id);
    const diff = Date.now() - res.dateReturned;

    expect(res.dateReturned).toBeDefined();
    expect(diff).toBeLessThan(10 * 1000);
  });
  it("should calculate the rental fee", async () => {
    rental.dateOfRental = subDays(new Date(), 7);
    await rental.save();

    await exec();

    const res = await Rental.findById(rental._id);

    expect(res.rentalFee).toBe(14);
  });
  it("should increase the stock in the movies db", async () => {
    await exec();
    const res = await Movie.findById(movieID);

    expect(res.numberInStock).toBe(movie.numberInStock + 1);
  });
  it("should return the rental", async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "_id",
        "dateOfRental",
        "dateReturned",
        "movie",
        "customer",
        "rentalFee",
      ])
    );
  });
});

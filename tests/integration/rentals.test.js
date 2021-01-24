const request = require("supertest");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Customer } = require("../../models/customer");
const { Genre } = require("../../models/genre");
const { Movie } = require("../../models/movie");
const mongoose = require("mongoose");
let server;
let token;
let movieID;
let customerID;
let genre;
let movie;

describe("/api/rentals", () => {
  beforeEach(async () => {
    server = require("../../index");
    token = new User().generateAuthToken();
  });
  afterEach(async () => {
    await Rental.deleteMany({});
    await Genre.deleteMany({});
    await Customer.deleteMany({});
    await Movie.deleteMany({});
    await server.close();
  });
  describe("GET /", () => {
    beforeEach(async () => {
      await Rental.collection.insertMany([
        { name: "rental1" },
        { name: "rental2" },
      ]);
    });
    it("should return all the rentals", async () => {
      const res = await request(server)
        .get("/api/rentals")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((c) => c.name === "rental1")).toBeTruthy();
      expect(res.body.some((c) => c.name === "rental2")).toBeTruthy();
    });
  });
  describe("POST / ", () => {
    const exec = async () => {
      return request(server)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerID, movieID });
    };
    beforeEach(async () => {
      genre = await new Genre({ name: "genre" }).save();
      movie = await new Movie({
        title: "movie1",
        genre,
        dailyRentalRate: 3,
        numberInStock: 6,
      }).save();
      movieID = movie._id;
      customerID = (
        await new Customer({ name: "1234456", phone: "1234567890" }).save()
      )._id;
    });
    it("should return 200 and the rental", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("movie");
      expect(res.body).toHaveProperty("customer");
    });
    it("should return 400 if movie ID is invalid", async () => {
      movieID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if customer ID is invalid", async () => {
      customerID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if movie's not in stock", async () => {
      movieID = (
        await new Movie({
          title: "movie1",
          genre,
          dailyRentalRate: 3,
          numberInStock: 0,
        }).save()
      )._id;

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should decrease the movie stock by 1", async () => {
      const originalNum = movie.numberInStock;
      const res = await exec();
      const current = (await Movie.findById(movieID)).numberInStock;

      expect(originalNum).toBe(current + 1);
    });
  });
});

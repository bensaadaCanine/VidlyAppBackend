const request = require("supertest");
const { Movie } = require("../../models/movie");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/movies", () => {
  let movie;
  let genre;
  let token;

  beforeEach(async () => {
    server = require("../../index");
    genre = new Genre({ name: "genre1" });
    await genre.save();

    movie = { title: "movie1", genre, numberInStock: 5, dailyRentalRate: 3 };
  });
  afterEach(async () => {
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });
  describe("GET /", () => {
    it("should return all movies", async () => {
      await Movie.collection.insertMany([
        { title: "movie1" },
        { title: "movie2" },
      ]);
      const res = await request(server).get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((m) => m.title === "movie1")).toBeTruthy();
      expect(res.body.some((m) => m.title === "movie2")).toBeTruthy();
    });
    describe("/api/movies/:id", () => {
      it("should return the specified movie", async () => {
        const newMovie = new Movie(movie);
        await newMovie.save();
        const result = await request(server).get("/api/movies/" + newMovie._id);

        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty("title", "movie1");
      });
      it("should return 404 if ID is invalid", async () => {
        const result = await request(server).get("/api/movies/1");

        expect(result.status).toBe(404);
      });
      it("should return 404 if ID wasn't found in db", async () => {
        const result = await request(server).get(
          "/api/movies/" + mongoose.Types.ObjectId().toHexString()
        );

        expect(result.status).toBe(404);
      });
    });
  });
  describe("POST / ", () => {
    const exec = () => {
      return request(server)
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);
    };
    beforeEach(async () => {
      token = new User().generateAuthToken();
      movie = {
        title: "movie1",
        genreID: genre._id,
        numberInStock: 5,
        dailyRentalRate: 3,
      };
    });
    it("should return 200 and the new movie", async () => {
      const result = await exec();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("title", movie.title);
    });
    it("should return 400 if Genre ID invalid", async () => {
      movie.genreID = mongoose.Types.ObjectId().toHexString();
      const result = await exec();

      expect(result.status).toBe(400);
    });
  });
  describe("PUT / ", () => {
    let movieUpdate;
    let movieID;
    beforeEach(async () => {
      token = new User().generateAuthToken();
      movie = new Movie({
        title: "movie1",
        genre,
        numberInStock: 5,
        dailyRentalRate: 3,
      });

      await movie.save();
      movieID = movie._id;

      movieUpdate = {
        title: "anotherMovie",
        genreID: genre._id,
        numberInStock: 2,
        dailyRentalRate: 1,
      };
    });

    const exec = () => {
      return request(server)
        .put("/api/movies/" + movieID)
        .set("x-auth-token", token)
        .send(movieUpdate);
    };
    it("should return 200 and the updated movie", async () => {
      const result = await exec();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("title", movieUpdate.title);
    });
    it("should return 400 id the Genre ID is invalid", async () => {
      movieUpdate.genreID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 404 if movie wasn't found in db", async () => {
      movieID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
  describe("DELETE / ", () => {
    let movieID;
    const exec = () => {
      return request(server)
        .delete("/api/movies/" + movieID)
        .set("x-auth-token", token);
    };
    beforeEach(async () => {
      token = new User().generateAuthToken();
      movie = new Movie({
        title: "movie1",
        genre,
        numberInStock: 5,
        dailyRentalRate: 3,
      });

      await movie.save();
      movieID = movie._id;
    });
    it("should return 200 and return the deleted movie", async () => {
      const res = await exec();
      const check = await Movie.findById(movieID);
      expect(check).not.toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", movie.title);
    });
  });
});

const mongoose = require("mongoose");
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
let server;

describe("/api/genres", () => {
  beforeEach(async () => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });
  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
    describe("/api/genres/:id", () => {
      it("should return the specified genre", async () => {
        const genre = new Genre({ name: "genre1" });
        await genre.save();

        const res = await request(server).get("/api/genres/" + genre._id);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("name", genre.name);
      });
      it("should return 404 if genre doesn't exist in the db", async () => {
        const res = await request(server).get(`/api/genres/1`);
        expect(res.status).toBe(404);
      });
    });
  });
  describe("POST /", () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 if the user's not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });
    it("should return 400 if the genre is less than 3 characters", async () => {
      name = "12";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if the genre is more than 15 characters", async () => {
      name = new Array(17).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it("should save the genre if it is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
    it("should return the genre if it is valid", async () => {
      await exec();
      const genre = Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });
  });
  describe("PUT / ", () => {
    let genre;
    let updateGenre;
    let token;
    let genreID;
    beforeEach(async () => {
      token = new User().generateAuthToken();
      genre = new Genre({ name: "genre1" });
      await genre.save();
      genreID = genre._id;
      updateGenre = { name: "anotherGenre" };
    });
    const exec = () => {
      return request(server)
        .put("/api/genres/" + genreID)
        .set("x-auth-token", token)
        .send(updateGenre);
    };
    it("should return 200 and the updated genre", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", updateGenre.name);
    });
    it("should return 404 if genre wasn't found in db", async () => {
      genreID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return 401 if client's not connected", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });
  });
  describe("DELETE / ", () => {
    let genre;
    let token;
    beforeEach(async () => {
      genre = await new Genre({ name: "genre1" }).save();
      token = new User().generateAuthToken();
    });
    const exec = () => {
      return request(server)
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);
    };
    it("should return 200 and the deleted genre", async () => {
      const res = await exec();
      const check = await Genre.findById(genre._id);

      expect(check).toBeFalsy();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});

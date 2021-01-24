let server;
const request = require("supertest");
const { User } = require("../../models/user");

describe("/api/users", () => {
  let user;

  beforeEach(async () => {
    server = require("../../index");
  });
  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });
  describe("GET / ", () => {
    it("should return the current user (me)", async () => {
      user = new User({
        name: "123456",
        password: "1234567890",
        email: "123@gmail.com",
      });
      token = user.generateAuthToken();
      await user.save();

      const res = await request(server)
        .get("/api/users/me")
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", user.name);
      expect(res.body).toHaveProperty("email", user.email);
    });
  });
  describe("POST /", () => {
    const exec = () => {
      return request(server).post("/api/users").send(user);
    };
    beforeEach(() => {
      user = {
        name: "123456",
        password: "1234567890",
        email: "123@gmail.com",
      };
    });
    it("should return 200 for registring new user in db", async () => {
      const result = await exec();

      expect(result.status).toBe(200);
      expect(result.body).toHaveProperty("name", user.name);
      expect(result.body).toHaveProperty("email", user.email);
    });
    it("should return 400 for trying to register existed user based on email", async () => {
      const another = new User({
        name: "another name",
        password: "another pass",
        email: user.email,
      });

      await another.save();
      const result = await exec();

      expect(result.status).toBe(400);
    });
  });
});

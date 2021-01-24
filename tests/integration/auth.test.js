let server;
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

describe("authMiddleWare", () => {
  let token;

  beforeEach(async () => {
    server = require("../../index");
    token = new User().generateAuthToken();
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  it("should return 401 if token's not provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });
  it("should return 400 if token's invalid", async () => {
    token = "123";
    const res = await exec();
    expect(res.status).toBe(400);
  });
  it("should return 200 if token's valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});

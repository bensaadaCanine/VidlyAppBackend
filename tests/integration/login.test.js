let server;
let user;
let standartPass;

const request = require("supertest");
const { User } = require("../../models/user");

describe("/api/auth", () => {
  const exec = async () => {
    return request(server)
      .post("/api/auth")
      .send({ email: user.email, password: standartPass });
  };

  beforeEach(async () => {
    server = require("../../index");
    standartPass = "1234567890";
    user = {
      name: "1234256",
      email: "123@gmail.com",
      password: standartPass,
    };
    await request(server).post("/api/users").send(user);
  });
  afterEach(async () => {
    await server.close();
    await User.deleteMany({});
  });
  it("should return 200 and return the token", async () => {
    const result = await exec();

    expect(result.status).toBe(200);
    expect(result.body).not.toBeNull();
  });
  it("should return 400 if email property is invalid", async () => {
    user.email = "111@gmail.com"; // Different email from the default user

    const result = await exec();

    expect(result.status).toBe(400);
  });
  it("should return 400 if password property is invalid", async () => {
    standartPass = "222222222"; // Different password from the default user

    const result = await exec();

    expect(result.status).toBe(400);
  });
});

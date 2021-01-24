const { User } = require("../../../models/user");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const user = { _id: mongoose.Types.ObjectId().toHexString() };
    const token = new User(user).generateAuthToken();

    const result = jwt.verify(token, config.get("jwtPrivateKey"));

    expect(result).toMatchObject(user);
  });
});

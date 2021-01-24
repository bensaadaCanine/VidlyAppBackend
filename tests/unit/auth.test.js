const auth = require("../../middleware/auth");
const { User } = require("../../models/user");

describe("authMiddleWareUnit", () => {
  it("should populate req.user with a valid JWT", () => {
    const token = new User().generateAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const next = jest.fn();
    const res = {};

    auth(req, res, next);

    expect(req.user).toBeDefined();
  });
});

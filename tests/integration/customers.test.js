const request = require("supertest");
const { Customer } = require("../../models/customer");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/customers", () => {
  let token;
  let customer;
  let customerUpdate;
  let customerID;

  beforeEach(() => {
    server = require("../../index");
    token = new User().generateAuthToken();
  });
  afterEach(async () => {
    await Customer.deleteMany({});
    await server.close();
  });

  describe("GET / ", () => {
    it("should return all customers", async () => {
      await Customer.collection.insertMany([
        { name: "name1" },
        { name: "name2" },
      ]);
      const res = await request(server)
        .get("/api/customers")
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((c) => c.name === "name1")).toBeTruthy();
      expect(res.body.some((c) => c.name === "name2")).toBeTruthy();
    });
    describe("/api/customers/:id", () => {
      beforeEach(async () => {
        customer = new Customer({
          name: "customer1",
          phone: "1234567890",
        });
        await customer.save();
      });
      it("should return the specified customer", async () => {
        const res = await request(server)
          .get("/api/customers/" + customer._id)
          .set("x-auth-token", token);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("name", customer.name);
      });
      it("should return 404 if invalid ID sent", async () => {
        const res = await request(server)
          .get("/api/customers/1")
          .set("x-auth-token", token);

        expect(res.status).toBe(404);
      });
      it("should return 404 no customer's found", async () => {
        const customerID = mongoose.Types.ObjectId().toHexString();

        const res = await request(server)
          .get("/api/customers/" + customerID)
          .set("x-auth-token", token);

        expect(res.status).toBe(404);
      });
    });
  });
  describe("POST /", () => {
    const exec = () => {
      return request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send(customer);
    };
    beforeEach(() => {
      customer = { name: "12345", phone: "1234567890" };
    });
    it("should return a customer", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "12345");
      expect(res.body).toHaveProperty("phone", "1234567890");
    });
    it("should return 400 if customer's already exists in db", async () => {
      await exec();
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if name prop not provided", async () => {
      customer.name = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 if phone prop not provided", async () => {
      customer.phone = "";
      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
  describe("PUT /", () => {
    const exec = () => {
      return request(server)
        .put("/api/customers/" + customerID)
        .set("x-auth-token", token)
        .send(customerUpdate);
    };
    beforeEach(async () => {
      customerID = mongoose.Types.ObjectId().toHexString();
      customer = new Customer({
        _id: customerID,
        name: "customer1",
        phone: "1234567890",
      });
      await customer.save();

      customerUpdate = { name: "customer2", phone: "0987654321", isGold: true };
    });
    it("should return the updated customer", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customerUpdate.name);
      expect(res.body).toHaveProperty("phone", customerUpdate.phone);
      expect(res.body).toHaveProperty("isGold", customerUpdate.isGold);
    });
    it("should return 404 if customer ID wasn't found in db", async () => {
      customerID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
  describe("DELETE /", () => {
    const exec = () => {
      return request(server)
        .delete("/api/customers/" + customerID)
        .set("x-auth-token", token);
    };
    beforeEach(async () => {
      customerID = mongoose.Types.ObjectId().toHexString();
      customer = new Customer({
        _id: customerID,
        name: "customer1",
        phone: "1234567890",
      });
      await customer.save();
    });

    it("should return 404 if ID is invalid", async () => {
      customerID = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });
    it("should return the deleted customer", async () => {
      const res = await exec();
      const check = await Customer.findById(customerID);
      expect(check).not.toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });
    it("should return 404 if the requested customer wasn't found in db", async () => {
      customerID = mongoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});

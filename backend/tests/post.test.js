const buildFastify = require("../app");
const supertest = require("supertest");
describe("Post tests", () => {
  let app;

  beforeAll(async () => {
    app = buildFastify();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  test("POST /forgot-password: not existing user", async () => {
    const response = await supertest(app.server)
      .post("/forgot-password")
      .send({ email: "nonexist@email.com" })
      .expect(204);
  });

  test("POST /user: fail to create a user when name is empty string", async () => {
    const userData = {
      name: "",
      email: "jane@example.com",
      password: "12345678",
      confirmedpassword: "12345678",
      dateOfBirth: "1990-01-02",
      isMale: false,
      height: 165,
      isMetric: true,
    };
    await supertest(app.server)
      .post("/user")
      .send(userData)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(
          "body/name must NOT have fewer than 1 characters"
        );
      });
  });

  test("POST /user: fail to create a user when passwords do not match", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
      password: "12345678",
      confirmedpassword: "87654321", // non-matching password
      dateOfBirth: "1990-01-02",
      isMale: false,
      height: 165,
      isMetric: true,
    };
    await supertest(app.server)
      .post("/user")
      .send(userData)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual("Passwords do not match");
      });
  });

  test("POST /user: creates a new user correctly", async () => {
    const response = await supertest(app.server)
      .post("/user")
      .send({
        name: "Test User",
        email: `test@example${Math.random() * 100}.com`,
        password: "testing",
        confirmedpassword: "testing",
        dateOfBirth: "1990-01-01",
        isMale: true,
        height: 175,
        isMetric: true,
      })
      .expect(201);
  });
});

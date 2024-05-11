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

  test("POST /login: with incorrect credentials", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "wrong@example.com", password: "wrongpassword" })
      .expect(401);
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

  test("POST /login: with correct credentials should return JWT tokens", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "test@gmail.com", password: "admin" })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("refreshToken");
      });
  });
});

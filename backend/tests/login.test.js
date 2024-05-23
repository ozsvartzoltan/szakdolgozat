const buildFastify = require("../app");
const supertest = require("supertest");

describe("Login tests", () => {
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

  test("POST /login: wrong format", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "email", password: "password123" })
      .expect(400);
  });

  test("POST /login: with incorrect credentials", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "wrong@example.com", password: "wrongpassword" })
      .expect(401);

    expect("Hibás email vagy jelszó!");
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

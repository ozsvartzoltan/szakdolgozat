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

  test("GET /user: returns user data", async () => {
    const response = await supertest(app.server)
      .get("/user")
      .expect(200)
      .expect("Content-Type", /json/);
  });

  test("POST /login: wrong format", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "email", password: "password123" })
      .expect(400);
  });

  test("POST /login: wrong credentials", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "user@example.com", password: "password123" })
      .expect(401);

    expect("Hibás email vagy jelszó!");
  });

  test("POST /login: successful login", async () => {
    const response = await supertest(app.server)
      .post("/login")
      .send({ email: "admin@gmail.com", password: "admin" })
      .expect(200);
  });
});

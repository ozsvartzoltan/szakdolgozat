const buildFastify = require("../app");
const supertest = require("supertest");

describe("Get paths", () => {
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
});

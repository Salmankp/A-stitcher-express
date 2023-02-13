const {
    describe,
    test,
    beforeAll, afterAll,
} = require("@jest/globals");

const {waitUntilAsserted} = require("./Utils");
const supertest = require("supertest");
require("dotenv").config();
const {disconnectDb, connectToDb} = require("../../config/db");

describe("HealthCheck integration test ", () => {
    let app;
    beforeAll(async () => {
        await connectToDb();
        app = require("../../serverContainer");
        await waitUntilAsserted(async () => {
            await supertest(app).get('/api/v1/health').expect(200)
        }, 10_000, 1_000)
    }, 20_000);

    afterAll(async ()=> {
        await disconnectDb();
    }, 100_000)

    test("Healthcheck is working" +
        "", async () => {
        await supertest(app).get('/api/v1/health').expect(200)
    }, 20_000);
});

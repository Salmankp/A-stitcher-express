const {
    describe,
    beforeAll,
    test,
    expect,
    afterAll
} = require("@jest/globals");

const {waitUntilAsserted} = require("./Utils");
const supertest = require("supertest");
require("dotenv").config();
const {disconnectDb, connectToDb} = require("../../config/db");

describe("Typeahead endpoint integration tests. ", () => {
    let app;
    beforeAll(async () => {
        await connectToDb();
        app = require("../../serverContainer");
        await waitUntilAsserted(async () => {
            await supertest(app).get('/api/v1/health').expect(200)
        }, 10_000, 1_000)
    }, 20_000);

    afterAll(async () => {
        console.log('Disconnecting from test')
        await disconnectDb();
    }, 100_000)

    test("Post typeahead", async () => {
        await supertest(app).post('/api/v1/typeahead')
            .send([
                {
                    fieldName: 'test',
                    allowedValue: 'test1'
                },
                {
                    fieldName: 'test',
                    allowedValue: 'test2'
                },
                {
                    fieldName: 'no',
                    allowedValue: 'test1'
                },
            ]).expect(200)

        console.log('Asserting data in tst');
        await waitUntilAsserted(async () => {
            const response = await supertest(app).get('/api/v1/typeahead/test')
                .send([
                    {
                        fieldName: 'test',
                        allowedValue: 'test1'
                    },
                    {
                        fieldName: 'test',
                        allowedValue: 'test2'
                    },
                    {
                        fieldName: 'no',
                        allowedValue: 'none'
                    },
                ]).expect(200);

            expect(response.body.length).toBe(2);
            expect(response.body).toContain('test1');
            expect(response.body).toContain('test2');
        }, 10_000, 1_000);

    }, 20_000);
    test("Post typeahead bad payload", async () => {
        await supertest(app).post('/api/v1/typeahead')
            .send([
                {
                    fieldName: 'test',
                    allowedValue: 'test1'
                },
                {
                    fieldName: 'test',
                    allowedValue: 'test2'
                },
                {
                    fieldName: 'no',
                    moti: 'test1'
                },
            ]).expect(400)
    }, 20_000);
});

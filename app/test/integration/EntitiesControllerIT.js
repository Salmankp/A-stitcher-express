const {
  describe,
  beforeAll,
  beforeEach,
  test,
  expect,
  afterAll,
} = require('@jest/globals');

const supertest = require('supertest');
require('dotenv').config();
const {disconnectDb, connectToDb} = require('../../config/db');
const Entity = require('../../models/Entity');
const objectId = require('mongoose').Types.ObjectId;
const generatetoken = require('../../helpers/generatetoken');
const User = require('../../models/User');

describe('/entities endpoint integration tests. ', () => {
  let app;
  let token;
  beforeAll(async () => {
    await connectToDb();
    const admin = await User.findOne({isAdmin: true});
    token = generatetoken(admin);
    app = require('../../serverContainer');
  }, 20_000);

  beforeEach(async () => {
    await Entity.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDb();
  }, 100_000);

  const testEntity = {
    name: 'test entity',
    address: 'test address',
    email: 'test@test.com',
    primaryContact: 'test contact',
    phoneNumber: '123456789',
    category: 'test category',
    phoneNumberExt: 'ext 123456789',
    companyFirm: 'test company',
    city: 'test city',
    state: 'test state',
    unit: 'test unit',
    zipCode: '1234',
    entityCategoriesReferences: [objectId()],
    status: 'test status',
    projectReferences: [objectId()],
  };

  test('GET / test', async () => {
    await Entity.create(testEntity);
    const res = await supertest(app)
        .get('/api/v1/entities')
        .set('Authorization', token.token)
        .expect(200);
    expect(res.body.entities.docs.length).toBe(1);
    Object.keys(testEntity).forEach((key) => {
      if (key === 'entityCategoriesReferences' || key === 'projectReferences') {
        expect(res.body.entities.docs[0][key][0]).toBe(testEntity[key][0].toString())
      } else {
        expect(res.body.entities.docs[0][key]).toBe(testEntity[key]);
      }
    });
  }, 20_000);
});

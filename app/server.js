require('dotenv').config();
const {connectToDb} = require('./config/db');

connectToDb().then(_=> console.log('Connected to mongo'));
const app = require("./serverContainer");
module.exports = app
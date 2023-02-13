require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const createAdmin = require('../helpers/createadmin');

const connectToDb = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    // mongoose.set('debug', true);
    console.log('MongoDB Connected.');
    const admin = await User.findOne({isAdmin: true});
    if (!admin) {
      console.log('Admin User not found. Making now');
      await createAdmin();
    }
  } catch (error) {
    console.log('MongoDB Connection Error: ', error);
    throw error;
  }
};

const disconnectDb = async () => {
  console.log(`DB status: ${mongoose.connection.readyState}`);
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};
module.exports = {connectToDb, disconnectDb};

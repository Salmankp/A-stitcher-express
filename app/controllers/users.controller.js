const validator = require('validator');
const User = require('../models/User');
const generateToken = require('../helpers/generatetoken');
const uuid = require('uuid').v4;
const s3 = require('../helpers/s3');
const path = require('path');
const fs = require('fs');

module.exports.register_post = async (req, res) => {
  try {
    // Fetch Data from Request
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();

    // Processing
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();

    res.status(200).json({ status: 200, message:"SignUp successfull.", data: generateToken(newUser) });
  } catch (error) {
    console.log('Server Error', error.stack);
    res.status(500).send('Server error');
  }
};

module.exports.users_put = async (req, res) => {
  try {
    // Fetch Data from Request
    const errors = [];
    const email = req.body.email ? req.body.email.trim() : '';
    const firstName = req.body.firstName ? req.body.firstName.trim() : '';
    const lastName = req.body.lastName ? req.body.lastName.trim() : '';

    // Validation
    if (validator.isEmpty(email) || validator.isEmpty(firstName) || validator.isEmpty(lastName)) {
      errors.push('firstName, lastName, email  are required');
    }
    if (!validator.isEmail(email)) errors.push('Email is not valid');
    let foundUser = await User.findOne({ _id: { $ne: req.user._id }, email });
    if (foundUser) {
      errors.push('email already registered');
    }

    if (errors.length) {
      return res.status(400).json({ status: 400, data: errors });
    }

    let avatar = req.user.avatar;
    // Processing
    if (req.files) {
      const fileName = `${uuid()}.${req.files.avatar.name.split('.').pop()}`;
      const filePath = path.resolve(__dirname, `../temp/${fileName}`);
      await req.files.avatar.mv(filePath);
      avatar = await s3.uploadToS3(filePath, fileName);
      fs.unlinkSync(filePath);
    }
    await User.findByIdAndUpdate(req.user._id, {
      firstName,
      lastName,
      email,
      avatar,
    });

    const user = await User.findById(req.user._id).lean();

    res.status(200).json({ status: 200, data: user });
  } catch (error) {
    console.log('Server Error', error.stack);
    res.status(500).send('Server error');
  }
};

module.exports.change_password_put = async (req, res) => {
  try {
    // Fetch Data from Request
    const password = req.body.password.trim();
    // Process
    await User.findByIdAndUpdate(req.user._id, {
      password,
    });

    res.status(200).json({ status: 200, data: 'Password Changed' });
  } catch (error) {
    console.log('Server Error', error.stack);
    res.status(500).send('Server error');
  }
};

const validator = require('validator');
const User = require('../models/User');
const fs = require('fs');

module.exports.validate_signup_request = async (req, res, next) => {
  try {
    // Fetch Data from Request
    const errors = [];
    const email = req.body.email ? req.body.email.trim() : '';
    const password = req.body.password ? req.body.password.trim() : '';
    const firstName = req.body.firstName ? req.body.firstName.trim() : '';
    const lastName = req.body.lastName ? req.body.lastName.trim() : '';

    // Validation
    if (
      validator.isEmpty(email) ||
      validator.isEmpty(password) ||
      validator.isEmpty(firstName) ||
      validator.isEmpty(lastName)
    ) {
      errors.push('firstName, lastName, email and password are required');
    }
    if (!validator.isEmail(email)) errors.push('Email is not valid');
    if (!validator.isByteLength(password, { min: 6 })) errors.push('Password must be at least 6 characters');
    let user = await User.findOne({ email });
    if (user) {
      errors.push('email already registered');
    }

    if (errors.length) {
      return res.status(400).json({ status: 400, data: errors });
    }
    next();
  } catch (error) {
    console.log('Server Error', error.stack);
    res.status(500).send('Server error');
  }
};

module.exports.validate_change_password = async (req, res, next) => {
    try {
      // Fetch Data from Request
      const oldPassword = req.body.oldPassword ? req.body.oldPassword.trim() : '';
      const password = req.body.password ? req.body.password.trim() : '';
  
      // Validation
      if (validator.isEmpty(oldPassword) || validator.isEmpty(password)) {
        return res.status(400).json({ status: 400, data: 'oldPassword and password are required' });
      }
      if (oldPassword.length < 6 || password.length < 6) {
        return res.status(400).json({ status: 400, data: 'password must be at least 6 characters' });
      }
      const user = await User.findById(req.user._id);
      const validate = await user.isValidPassword(oldPassword);
      if (!validate) {
        return res.status(400).json({ status: 400, data: 'old password is not correct' });
      }
      next();
    } catch (error) {
      console.log('Server Error', error.stack);
      res.status(500).send('Server error');
    }
  };
  
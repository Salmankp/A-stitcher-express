const User = require('../models/User');

module.exports = async () => {
  const newAdmin = new User({
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@admin.com',
    isAdmin: true,
    password: 'admin',
  });
  await newAdmin.save();
  return;
};

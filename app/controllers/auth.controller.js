const generateToken = require("../helpers/generatetoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require('jsonwebtoken');


module.exports.login_post = async function (req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validate = await user.isValidPassword(req.body.password);
    if (!validate) {
      return res.status(400).json({ message: "Wrong Password" });
    }
    req.user = user;
    req.user.password = undefined;
    let data = generateToken(req.user);
    let user_refresh_token = await RefreshToken.findOne({ user_id:data.user._id });
    if(user_refresh_token)
      await RefreshToken.updateOne({ user_id:data.user._id }, {refreshToken: data.refreshToken});
    else{
      var token = new RefreshToken({ refreshToken: data.refreshToken, user_id:data.user._id });
      token.save();
    }
    return res.status(200).json({ status: 200, data  });
  } catch (error) {
    console.log("login_post error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

module.exports.me_get = (req, res, next) => {
  try{
    req.user.password = undefined;
    return res.status(200).json({ status: 200, data: generateToken(req.user) });
  } catch (error) {
    console.log("me_get", error.stack);
    res.status(500).json({ status: 500, data: "Server Error" });
  }
};

module.exports.resfreshToken = async(req, res, next) => {
  try{
    if((req.body.refresh_token) && (await RefreshToken.findOne({ refreshToken: req.body.refresh_token }))) {
        const token = 'Bearer ' + jwt.sign({ id: req.body.user_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
        const user = await User.findById(req.body.user_id );
        user.password = undefined;
        const response = {
            "token": token,
            user
        }
        res.status(200).json(response);        
    } else {
        res.status(404).send('Invalid request')
    }
  } catch (error) {
    console.log("refreshToken error", error.stack);
    res.status(500).json({ status: 500, data: "Server Error", error });
  }
};

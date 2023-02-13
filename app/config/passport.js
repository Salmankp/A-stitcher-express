const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(localLogin);
  passport.use(jwtLogin);
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

// Local Strategy - Used for Login
const localLogin = new LocalStrategy({usernameField: 'email', passwordField: 'password'}, 
  async (email, password, done) => {
  // Match user
  try {
    const user = await User.findOne({email});
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const validate = await user.isValidPassword(password);
    if (!validate) {
      return done(null, false, { message: 'Wrong Password' });
    }
    return done(null, user, { message: 'Logged in Successfully' });
  } catch (error) {
    return done(error);
  }
});

// JWT Strategy - Used for token authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const jwtLogin = new JwtStrategy(jwtOptions, function(jwtPayload, done) {
  return User.findById(jwtPayload.id)
    .then(user => {
      if (!user)
        return done(null, false);

      return done(null, user);
    })
    .catch(err => done(err, false))
});

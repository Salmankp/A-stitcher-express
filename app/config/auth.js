module.exports.ensureAuthenticatedAdmin = (req, res, next) => {
  if (process.env.NODE_ENV == 'DEVELOPMENT') return next();
  if (req.isAuthenticated()) {
    if (req.user.isAdmin == true) {
      return next();
    } else {
      req.flash('error_msg', 'You need Admin privileges to access this page');
      res.redirect('/admin/login');
    }
  } else {
    req.flash('error_msg', 'Please Signin First...');
    res.redirect('/admin/login');
  }
};

const User = require("../../models/User");

module.exports.users_get = async (req, res) => {
  let limit = 20;
  let offset = 0;
  if (req.query.page_number && req.query.page_number == 1) offset = 0;
  else if (req.query.page_number && req.query.page_number > 1)
    offset = (req.query.page_number - 1) * limit;
  let users = await User.paginate(
    { isAdmin: false },
    {
      offset: offset,
      limit: limit,
    }
  ).then((users) => {
    return users;
  });
  // const users = await User.find({ isAdmin: false });
  res.render("users/users", { users });
};

module.exports.delete_user_get = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "User Deleted.");
  res.redirect("/admin/users");
};

module.exports.new_user_get = async (req, res) => {
  res.render("users/new");
};

module.exports.users_post = async (req, res) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  console.log("here");
  const newUser = new User({ firstName, lastName, email, password });
  await newUser.save();
  req.flash("success_msg", "New User Created.");
  res.redirect("/admin/users");
};

module.exports.edit_user_get = async (req, res) => {
  const foundUser = await User.findById(req.params.id);

  res.render("users/edit", { foundUser });
};

module.exports.edit_user_post = async (req, res) => {
  const id = req.body.id.trim();
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  await User.findByIdAndUpdate(id, { firstName, lastName, email });
  if (password !== "") {
    await User.findByIdAndUpdate(id, { password });
  }

  req.flash("success_msg", "User Updated.");
  res.redirect("/admin/users");
};

const User = require("../models/user.model");

exports.checkDuplicateEmail = async (req, res, next) => {
  let user = await User.findOne({
    email: req.body.email,
  });

  if (user) {
    return res.json({
      error: true,
      message: "Email is already in use",
    });
  }
  next();
};

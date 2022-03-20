const Joi = require("joi");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { generateJwt } = require("../utility/generateJwt");
const randomize = require("randomatic");

exports.Signup = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body.email) throw new Error("Cannot signup without email");
    if (!req.body.firstName || !req.body.lastName) throw new Error("Cannot signup without first name and last name");

    const hash = await User.hashPassword(req.body.password);
    req.body.password = hash;

    const newUser = new User(req.body);
    await newUser.save();

    const { error, token } = await generateJwt(newUser.name, newUser._id);
    if (error) throw new Error("Couldn't create access token. Please try again later");

    newUser.accessToken = token;

    await newUser.save();

    res.status(200).send({
      success: true,
      message: "Registration Success",
      accessToken: token,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      res.status(400).send({ error: true, message: err.message });
      return;
    }
    res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Please make a valid request");

    const user = await User.findOne({ email: email });
    if (!user) throw new Error("User not found");

    const isValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const { error, token } = await generateJwt(user.name, user._id);
    if (error) throw new Error("Couldn't create access token. Please try again later");

    user.accessToken = token;

    await user.save();

    res.status(200).send({
      success: true,
      message: "User logged in successfully",
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: err.message,
    });
  }
};

exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Cannot be processed");

    const user = await User.findOne({
      email: email,
    });

    if (!user) throw new Error("Account not found");

    let code = randomize("Aa0", 60);
    let expiry = Date.now() + 60 * 1000 * 15;
    user.resetPasswordToken = code;
    user.resetPasswordExpires = expiry;

    //Send email service to be added

    await user.save();
    res.status(200).send({
      success: true,
      message: "Sent notification to reset your password",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new Error("Provide token and a new password");

    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Password reset token is invalid or expired.");

    const hash = await User.hashPassword(req.body.newPassword);
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = "";
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password has been changed",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

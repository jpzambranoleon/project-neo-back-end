const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/user.controller");
const { checkDuplicateEmail } = require("../middlewares/signup.middleware");

router.post("/signup", [checkDuplicateEmail], AuthController.Signup);
router.post("/login", AuthController.Login);
router.patch("/forgot", AuthController.ForgotPassword);
router.patch("/reset", AuthController.ResetPassword);

module.exports = router;

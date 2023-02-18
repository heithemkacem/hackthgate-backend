//Express Router
const express = require("express");
const router = express.Router();
const {
  clientRegisterValidation,
  LoginValidation,
} = require("./../../util/clientVerification");
const {
  sendOTPVerificationEmail,
} = require("./../otp_verification/controller");
const {
  AuthenticateClient,
  CreateClient,
  ForgetPassword,
  ResetPassword,
} = require("./controller");
//Passport
const passport = require("passport");
const { strategy } = require("./../../security/strategy");
router.use(passport.initialize());
passport.use(strategy);

//! Client Inscription
router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    const { error } = clientRegisterValidation(req.body);
    if (error) {
      res.send({ status: "Failed", message: error["details"][0]["message"] });
    } else {
      const createdClient = await CreateClient({
        fullname,
        email,
        password,
      });
      await sendOTPVerificationEmail(createdClient);
      res.json({
        status: "Success",
        message: "Client created successfully",
        client: createdClient,
      });
    }
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});
//! Client Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error } = LoginValidation(req.body);
    if (error) {
      res.send({ status: "Failed", message: error["details"][0]["message"] });
    } else {
      const authenticated = await AuthenticateClient(email, password);
      res.json(authenticated);
    }
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});
//!Client Forget Password
router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;
    const fetchedUser = await ForgetPassword(email);
    res.json({
      status: "Success",
      message: "Verification Email Was Sent",
      id: fetchedUser._id,
    });
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});

//! Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, email } = req.body;
    if (newPassword != confirmNewPassword) {
      throw Error("New password and confirm new password are not same");
    } else {
      const updatedUser = await ResetPassword(newPassword, email);
      res.json({
        status: "Success",
        message: "Password was changed successfully",
        client: updatedUser,
      });
    }
  } catch (error) {
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const ClientRoutes = require("./../domains/client");
const OTPRoutes = require("./../domains/otp_verification");
const AuthRoutes = require("./../domains/auth");

router.use("/client", ClientRoutes);
router.use("/otp", OTPRoutes);
router.use("/auth", AuthRoutes);

module.exports = router;

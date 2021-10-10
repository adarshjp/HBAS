const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth");
router.get("/register", authController.registerGet);
router.get("/login", authController.loginGet);
router.get("/logout", authController.logout);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
  })
);
router.post("/register", authController.registerPost);

module.exports = router;

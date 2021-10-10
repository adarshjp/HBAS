const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const admitController = require("../controllers/admit");
const viewController = require("../controllers/view");
const dischargeController = require("../controllers/discharge");
router.get("/home", authController.isLoggedIn, homeController.home);
router.get("/admit", authController.isLoggedIn, admitController.admitGet);
router.post("/admit/:id", authController.isLoggedIn, admitController.admitPost);
router.get(
  "/viewpatients",
  authController.isLoggedIn,
  viewController.viewpatients
);
router.post(
  "/discharge/:id/:status",
  authController.isLoggedIn,
  dischargeController.discharge
);
router.get("/view/:id", authController.isLoggedIn, viewController.viewOne);

module.exports = router;

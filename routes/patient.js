const express = require("express");
const router = express.Router();
const PatientController = require("../controllers/patient");
router.get("/", PatientController.home);
router.get("/view", PatientController.view);
router.get("/request", PatientController.requestGet);
router.post("/request", PatientController.requestPost);

module.exports = router;

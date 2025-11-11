const express = require("express");
const router = express.Router();

const patientController = require("../controllers/patientController");
const verifyUserRole = require("../middlewares/verifyUserRole");

router.post('/patients', verifyUserRole([]), patientController.createPatient);


module.exports = router;
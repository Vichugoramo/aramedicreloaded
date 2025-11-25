const express = require("express");
const router = express.Router();

const recordController = require("../controllers/recordController");

const verifyUserRole = require("../middlewares/verifyUserRole");

// Creating a medical record during signup should be a public endpoint
// (the controller will generate a token for the new patient). Do not
// require verifyUserRole here.
router.post('/record', recordController.createRecord);
const verifyToken = require("../middlewares/auth");
// Requiere token de 'PACIENTE'
router.get(
    '/record', 
    verifyToken,
    verifyUserRole(['PACIENTE']), 
    recordController.getOwnRecord
);

// Requiere token de 'MEDICO'
router.get(
    '/record/:patientId', 
    verifyToken, 
    verifyUserRole(['MEDICO']), 
    recordController.getPatientRecordById
);


module.exports = router;
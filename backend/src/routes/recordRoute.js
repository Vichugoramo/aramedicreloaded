const express = require("express");
const router = express.Router();

const recordController = require("../controllers/recordController");

// Asumo que tienes este middleware de autenticación
const verifyUserRole = require("../middlewares/verifyUserRole"); // Ajusta la ruta si es necesario

// Creating a medical record during signup should be a public endpoint
// (the controller will generate a token for the new patient). Do not
// require verifyUserRole here.
router.post('/record', recordController.createRecord);
const verifyToken = require("../middlewares/auth");
// --- NUEVA RUTA (Para que el PACIENTE vea su propio historial) ---
//
// Requiere token de 'PACIENTE'
router.get(
    '/record', 
    verifyToken, // Verificamos el token
    verifyUserRole(['PACIENTE']), // Protegemos la ruta
    recordController.getOwnRecord
);

//
// --- NUEVA RUTA (Para que el MÉDICO vea el historial de un paciente) ---
//
// Requiere token de 'MEDICO'
router.get(
    '/record/:patientId', 
    verifyToken, // Verificamos el token
    verifyUserRole(['MEDICO']), // Protegemos la ruta
    recordController.getPatientRecordById
);


module.exports = router;
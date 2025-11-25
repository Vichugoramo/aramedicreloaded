const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const auth = require("../middlewares/auth");
const verifyUserRole = require("../middlewares/verifyUserRole");
router.get(
    '/logs',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.getPatientLogs
);

// Crear un nuevo registro
router.post(
    '/logs',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.createLog
);

// Actualizar un registro
router.put(
    '/logs/:logId',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.updateLog
);

// Eliminar un registro
router.delete(
    '/logs/:logId',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.deleteLog
);
// Obtener los registros de un paciente específico
router.get(
    '/logs/:patientId',
    auth,
    verifyUserRole(['MEDICO']),
    logController.getLogsForDoctor
);

module.exports = router;
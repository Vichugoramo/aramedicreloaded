const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const auth = require("../middlewares/auth"); // Tu middleware de autenticación
const verifyUserRole = require("../middlewares/verifyUserRole");

// --- Rutas para el Paciente (requiere rol PACIENTE) ---

// Obtener todos los registros del paciente logueado
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

// Actualizar un registro (asegura que el paciente sea el dueño)
router.put(
    '/logs/:logId',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.updateLog
);

// Eliminar un registro (asegura que el paciente sea el dueño)
router.delete(
    '/logs/:logId',
    auth,
    verifyUserRole(['PACIENTE']),
    logController.deleteLog
);

// --- Ruta para el Médico (requiere rol MEDICO) ---

// Obtener los registros de un paciente específico
router.get(
    '/logs/:patientId',
    auth,
    verifyUserRole(['MEDICO']),
    logController.getLogsForDoctor
);

module.exports = router;
const express = require('express');
const router = express.Router();
const verifyUserRole = require('../middlewares/verifyUserRole');
const emergencyController = require('../controllers/emergencyController');


router.get('/emergency-types', verifyUserRole(['MEDICO', 'PACIENTE']),emergencyController.getAllEmergencies);








module.exports = router;
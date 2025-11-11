const express = require('express');
const router = express.Router();
const verifyUserRole = require('../middlewares/verifyUserRole');
const userController = require('../controllers/userController');


router.get('/profile',  verifyUserRole(["MEDICO", "PACIENTE"]), userController.getProfileData);


module.exports = router;
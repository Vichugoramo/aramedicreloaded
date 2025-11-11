const express = require('express');
const router = express.Router();
const specialityController = require('../controllers/specialityController');
const verifyUserRole = require('../middlewares/verifyUserRole');


router.get('/specialities',  verifyUserRole([]),specialityController.getSpecialities);





module.exports = router;
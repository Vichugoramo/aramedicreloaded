const express = require("express");
const router = express.Router();

const medicController = require("../controllers/medicController");
const verifyUserRole = require("../middlewares/verifyUserRole");

router.post('/medics', verifyUserRole([]) ,medicController.createmedic);

module.exports = router;
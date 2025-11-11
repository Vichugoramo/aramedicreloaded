const express = require("express");
const router = express.Router();

const recordController = require("../controllers/recordController");

// Creating a medical record during signup should be a public endpoint
// (the controller will generate a token for the new patient). Do not
// require verifyUserRole here.
router.post('/record', recordController.createRecord);


module.exports = router;
const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middlewares/auth");
const verifyUserRole = require("../middlewares/verifyUserRole");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// Subir archivo
router.post(
    '/files/upload',
    auth,
    verifyUserRole(['MEDICO']),
    upload.single('file'),
    fileController.uploadFile
);

// Obtener archivos de un paciente
router.get(
    '/files/:patientId',
    auth,
    fileController.getFilesByPatient
);

module.exports = router;
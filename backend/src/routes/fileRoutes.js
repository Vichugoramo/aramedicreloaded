const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middlewares/auth");
const verifyUserRole = require("../middlewares/verifyUserRole");
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Asegúrate de que esta carpeta exista en tu backend
    },
    filename: function (req, file, cb) {
        // Guardamos el archivo con un nombre único: fecha + nombre original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// --- Rutas ---

// Subir archivo (Solo Médicos)
router.post(
    '/files/upload',
    auth,
    verifyUserRole(['MEDICO']),
    upload.single('file'), // 'file' es el nombre del campo en el FormData
    fileController.uploadFile
);

// Obtener archivos de un paciente (Para Paciente y Médico)
router.get(
    '/files/:patientId',
    auth,
    fileController.getFilesByPatient
);

module.exports = router;
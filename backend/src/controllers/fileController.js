const fileRepository = require("../repositories/fileRepository");

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo o el formato no es válido (PDF)." });
        }

        const { patientId, description } = req.body;
        const medicId = req.user.userId;
        const fileName = req.file.originalname;
        // Construimos la URL accesible. Ajusta 'http://localhost:3000' a tu dominio real o usa una variable de entorno.
        // Nota: req.file.path suele ser 'uploads\archivo.pdf'. Necesitamos normalizarlo para URL.
        const filePath = req.file.path.replace(/\\/g, "/"); 

        const newFile = await fileRepository.saveFileRecord({
            patientId,
            medicId,
            fileName,
            filePath,
            description
        });

        res.status(201).json({ message: "Archivo subido exitosamente", file: newFile });
    } catch (error) {
        next(error);
    }
};

const getFilesByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        // Seguridad: Un paciente solo puede ver sus propios archivos
        if (req.user.type === 'PACIENTE' && req.user.userId != patientId) {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const files = await fileRepository.getFilesByPatientId(patientId);
        res.status(200).json(files);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadFile,
    getFilesByPatient
};
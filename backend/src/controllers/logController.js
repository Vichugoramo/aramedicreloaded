const logRepository = require("../repositories/logRepository");

// (Paciente) Obtiene sus propios registros
const getPatientLogs = async (req, res, next) => {
    try {
        const patientId = req.user.userId;
        const logs = await logRepository.getLogsByPatientId(patientId);
        res.status(200).json(logs);
    } catch (error) {
        next(error);
    }
};

// (Médico) Obtiene los registros de un paciente
const getLogsForDoctor = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const logs = await logRepository.getLogsByPatientId(patientId);
        res.status(200).json(logs);
    } catch (error) {
        next(error);
    }
};

// (Paciente) Crea un nuevo registro
const createLog = async (req, res, next) => {
    try {
        const patientId = req.user.userId;
        const { log_date, description } = req.body;

        if (!log_date || !description) {
            return res.status(400).json({ message: "Fecha y descripción son requeridas" });
        }

        const newLog = await logRepository.createLog(patientId, log_date, description);
        res.status(201).json(newLog);
    } catch (error) {
        next(error);
    }
};

// (Paciente) Actualiza un registro
const updateLog = async (req, res, next) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.userId;
        const { log_date, description } = req.body;

        // Verifica que el paciente sea el dueño del registro
        const logOwner = await logRepository.getLogOwner(logId);
        if (!logOwner || logOwner.id_paciente !== patientId) {
            return res.status(403).json({ message: "No autorizado para modificar este registro" });
        }

        const updatedLog = await logRepository.updateLog(logId, log_date, description);
        res.status(200).json(updatedLog);
    } catch (error) {
        next(error);
    }
};

// (Paciente) Elimina un registro
const deleteLog = async (req, res, next) => {
    try {
        const { logId } = req.params;
        const patientId = req.user.userId;

        // Verifica que el paciente sea el dueño
        const logOwner = await logRepository.getLogOwner(logId);
        if (!logOwner || logOwner.id_paciente !== patientId) {
            return res.status(403).json({ message: "No autorizado para eliminar este registro" });
        }

        await logRepository.deleteLog(logId);
        res.status(204).send(); // Sin contenido
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPatientLogs,
    getLogsForDoctor,
    createLog,
    updateLog,
    deleteLog
};
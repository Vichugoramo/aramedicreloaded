const recordRepository = require("../repositories/recordRepository");
const { generateToken, getTypeAndIdFromToken } = require("../utils/tokenUtils");

const createRecord = async (req, res, next) => {
    const record = req.body;
    if(
        !record ||
        !['S', 'N'].includes(record.question1) ||
        !['S', 'N'].includes(record.question2) ||
        !['S', 'N'].includes(record.question3) ||
        !['S', 'N'].includes(record.question4)
    ){
        return res.status(400).json({
            message: 'Petición incorrecta: Faltan respuestas obligatorias (S/N)'
        });
    }

    try{
        let token = req.body?.token;
        if (!token && req.headers?.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
        }

        let patientId;
        if (token) {
            const decoded = getTypeAndIdFromToken(token);
            patientId = decoded.userId;
        }

        if (!patientId) {
            return res.status(401).json({ message: 'Unauthorized: missing patient token' });
        }

        const recordCreated = await recordRepository.createRecord(patientId, record);
        const newToken = generateToken(recordCreated.id || patientId, "PACIENTE");

        const response = {
            message: "Record created",
            token: newToken
        };

        return res.status(201).json(response);
    }catch(error){
        return next(error);
    }
};

const getOwnRecord = async (req, res, next) => {
    try {
        const { userId: patientId } = req.user; 

        if (!patientId) {
            return res.status(401).json({ message: 'Unauthorized: Token inválido' });
        }

        const record = await recordRepository.getRecordById(patientId);

        if (!record) {
            return res.status(404).json({ message: "Historial no encontrado" });
        }

        return res.status(200).json(record);

    } catch(error) {
        return next(error);
    }
};

const getPatientRecordById = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({ message: "Petición incorrecta: Falta patientId" });
        }

        const record = await recordRepository.getRecordById(patientId);

        if (!record) {
            return res.status(404).json({ message: "Historial no encontrado" });
        }

        return res.status(200).json(record);

    } catch(error) {
        return next(error);
    }
};


module.exports = {
    createRecord,
    getOwnRecord,          
    getPatientRecordById 
};
const recordRepository = require("../repositories/recordRepository");
const { generateToken, getTypeAndIdFromToken } = require("../utils/tokenUtils");


const createRecord = async (req, res, next) => {
    const record = req.body;
    if(
        !record ||
        !['S', 'N'].includes(record.question1) ||
        !['S', 'N'].includes(record.question2) ||
        !['S', 'N'].includes(record.question3) ||
        !['S', 'N'].includes(record.question4) ||
        !record.questionwrite
    ){
        return res.status(400).json({
            message: 'Petición incorrecta'
        });
    }
    try{
        // Try to obtain patient id from a token sent in the body or in Authorization header
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
            // If no patient id provided, return 401 because we don't know to which patient attach the record
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





module.exports = {
    createRecord
};
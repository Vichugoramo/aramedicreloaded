const db = require('../config/db').getDB();

const saveFileRecord = async ({ patientId, medicId, fileName, filePath, description }) => {
    const query = `
        INSERT INTO medical_files (id_paciente, id_medico, file_name, file_path, description)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [patientId, medicId, fileName, filePath, description]);
    
    return {
        id: result.insertId,
        patientId,
        fileName,
        filePath,
        uploadDate: new Date()
    };
};

const getFilesByPatientId = async (patientId) => {
    const query = `
        SELECT id, file_name, file_path, description, upload_date 
        FROM medical_files 
        WHERE id_paciente = ? 
        ORDER BY upload_date DESC
    `;
    const [rows] = await db.query(query, [patientId]);
    return rows;
};

module.exports = {
    saveFileRecord,
    getFilesByPatientId
};
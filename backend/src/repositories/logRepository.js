const db = require('../config/db').getDB();

const getLogsByPatientId = async (patientId) => {
    const query = `
        SELECT id, id_paciente, DATE_FORMAT(log_date, '%Y-%m-%d') as log_date, description 
        FROM medical_logs 
        WHERE id_paciente = ? 
        ORDER BY log_date DESC
    `;
    const [logs] = await db.query(query, [patientId]);
    return logs;
};

// Crea un nuevo registro
const createLog = async (patientId, log_date, description) => {
    const query = `
        INSERT INTO medical_logs (id_paciente, log_date, description) 
        VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [patientId, log_date, description]);
    
    return {
        id: result.insertId,
        id_paciente: patientId,
        log_date,
        description
    };
};

const getLogOwner = async (logId) => {
    const query = "SELECT id_paciente FROM medical_logs WHERE id = ?";
    const [rows] = await db.query(query, [logId]);
    return rows[0];
};

// Actualiza un registro
const updateLog = async (logId, log_date, description) => {
    const query = `
        UPDATE medical_logs 
        SET log_date = ?, description = ? 
        WHERE id = ?
    `;
    await db.query(query, [log_date, description, logId]);
    
    return {
        id: logId,
        log_date,
        description
    };
};

// Elimina un registro
const deleteLog = async (logId) => {
    const query = "DELETE FROM medical_logs WHERE id = ?";
    await db.query(query, [logId]);
    return;
};

module.exports = {
    getLogsByPatientId,
    createLog,
    getLogOwner,
    updateLog,
    deleteLog
};
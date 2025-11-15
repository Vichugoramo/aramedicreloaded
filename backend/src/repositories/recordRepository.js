const db = require('../config/db').getDB();

/**
 * Create a medical record for a given patient
 * @param {Number} patientId
 * @param {Object} record - contiene question1..4 y details1..4
 * @returns {Promise<{id: Number, patientId: Number}>}
 */
const createRecord = async (patientId, record) => { 

    // Actualizamos la query para incluir las 4 columnas de detalles
    const insertRecordQuery = `
        INSERT INTO historial
        (id_paciente, question1, details1, question2, details2, question3, details3, question4, details4) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try{
        // Mapeamos los valores en el orden correcto
        const values = [
            patientId, 
            record.question1, record.details1 || null, // Si viene vacío, guardamos null o string vacío
            record.question2, record.details2 || null,
            record.question3, record.details3 || null,
            record.question4, record.details4 || null
        ];

        const [result] = await db.query(insertRecordQuery, values);
        
        return { id: result.insertId, patientId };

    } catch(err){
        console.error('createRecord error', err.message || err);
        throw new Error("Error creating record");
    }
};

/**
 * Get record by Patient ID
 * @param {Number} id 
 */
const getRecordById = async (id) => {
    // Actualizamos el SELECT para traer los detalles
    const query = `
        SELECT 
            h.id, 
            h.question1, h.details1,
            h.question2, h.details2,
            h.question3, h.details3,
            h.question4, h.details4
        FROM historial h
        WHERE h.id_paciente = ?
        LIMIT 1
    `;
    const [result] = await db.query(query, [id]);
    const record = result[0];
    
    if (!record) return null;

    return {
        id: record.id,
        question1: record.question1,
        details1: record.details1,
        question2: record.question2,
        details2: record.details2,
        question3: record.question3,
        details3: record.details3,
        question4: record.question4,
        details4: record.details4
    };
};

module.exports = {
    createRecord,
    getRecordById
};
const db = require('../config/db').getDB();

/**
 * Create a medical record for a given patient
 * @param {Number} patientId
 * @param {Object} record
 * @returns {Promise<{id: Number, patientId: Number}>}
 */
const createRecord = async (patientId, record) => { 

    const insertRecordQuery = `
        INSERT INTO historial
        (id_paciente, question1, details1, question2, details2, question3, details3, question4, details4) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try{
        const values = [
            patientId, 
            record.question1, record.details1 || null, 
            record.question2, record.details2 || null,
            record.question3, record.details3 || null,
            record.question4, record.details4 || null
        ];

        const [result] = await db.query(insertRecordQuery, values);
        
        return { id: patientId, patientId };

    } catch(err){
        console.error('createRecord error', err.message || err);
        throw new Error("Error creating record");
    }
};

/**
 * Get record by Patient ID
 * @param {Number} id 
 * @returns {Promise<HistorialData>}
 */
const getRecordById = async (id) => {
    const query = `
        SELECT 
            h.id_paciente, 
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
        id_paciente: record.id_paciente,
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




/**
 * @typedef {Object} HistorialData
 * @property {Number} id_paciente
 * @property {'S' | 'N'} question1,
 * @property {string} details1,
 * @property {'S' | 'N'} question2,
 * @property {string} details2,
 * @property {'S' | 'N'} question3,
 * @property {string} details3,
 * @property {'S' | 'N'} question4,
 * @property {string} details4
 * */


module.exports = {
    createRecord,
    getRecordById
};
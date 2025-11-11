const db = require('../config/db').getDB();

/**
 * 
 * @param {{question1: 'S' | 'N', question2: 'S' | 'N', question3: 'S' | 'N', question4: 'S' | 'N', questionwrite: string}} patient 
 * los datos del historial a crear
 * @returns {Promise<{id: number, question1: 'S' | 'N', question2: 'S' | 'N', question3: 'S' | 'N', question4: 'S' | 'N', questionwrite: string}>}
 * los datos del historial creado
 */
/**
 * Create a medical record for a given patient
 * @param {Number} patientId
 * @param {{question1: 'S'|'N', question2: 'S'|'N', question3: 'S'|'N', question4: 'S'|'N', questionwrite: string}} record
 * @returns {Promise<{id: Number, patientId: Number}>}
 */
const createRecord = async (patientId, record) => { 

    const insertRecordQuery = `
        INSERT INTO historial(id_paciente, question1, question2, question3, question4, questionwrite) VALUES(?, ?, ?, ?, ?, ?)
    `;
    try{
        const [result] = await db.query(insertRecordQuery, [patientId, record.question1, record.question2, record.question3, record.question4, record.questionwrite]);
        const insertedId = result.insertId;
        return { id: insertedId, patientId };
    }catch(err){
        // Log error and rethrow a generic message
        console.error('createRecord error', err.message || err);
        throw new Error("Error creating record");
    }
};


/**
 * 
 * @param {Number} id 
 * @returns {Promise<HistorialData>}
 */
const getRecordById = async (id) => {
    const query = `
        SELECT h.id, h.question1, h.question2, h.question3, h.question4, h.questionwrite
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
        question2: record.question2,
        question3: record.question3,
        question4: record.question4,
        questionwrite: record.questionwrite
    };
};




/**
 * @typedef {Object} HistorialData
 * @property {Number} id
 * @property {'S' | 'N'} question1,
 * @property {'S' | 'N'} question2,
 * @property {'S' | 'N'} question3,
 * @property {'S' | 'N'} question4,
 * @property {string} questionwrite
 * 
 */


module.exports = {
    createRecord,
    getRecordById
};
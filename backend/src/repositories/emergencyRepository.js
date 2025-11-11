const db = require('../config/db').getDB();

/**
 * @returns {Promise<Array<EmergencyData:{id: number, nombre: string, descripcion: string}>>} Regresa los tipos de emergencias que se pueden registrar
 */
const findAllEmergencies = async () => {

    const queryEmergencies = `
        SELECT * FROM tipo_emergencias
    `;
    const result = await db.query(queryEmergencies);
    return result[0];
};



module.exports = {
    findAllEmergencies
};
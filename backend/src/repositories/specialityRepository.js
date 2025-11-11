const db = require('../config/db').getDB();

/**
 * 
 * @returns {Promise<speciality[]:{id: number, nombre: string}[]>} array de especialidades
 */
const getSpecialities = async () => {
    const queryGetSpecialities = `SELECT * FROM especialidades`;
    const [specialities] = await db.query(queryGetSpecialities);
    return specialities;
};


/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<SpecialityTypeEmergency[]>} array de especialidades
 */
const getSpecilitiesAndEmergenciesAssociatedWithMedicData = async (medicId) => {
    const queryGetSpecialities = `
        SELECT etp.*
        FROM especialidad_tipo_emergencia etp
        inner JOIN medicos m ON m.id_especialidad = etp.id_especialidad
        WHERE m.id_usuario = ?
    `;
    const [specialities] = await db.query(queryGetSpecialities, [medicId]);
    return specialities.map(speciality => ({
        id: speciality.id,
        specialityId: speciality.id_especialidad,
        emergencyTypeId: speciality.id_tipo_emergencia
    }));
};


/**
 * @typedef {Object} SpecialityTypeEmergency
 * @property {Number} id
 * @property {Number} specialityId
 * @property {Number} emergencyTypeId
 * 
 */

module.exports = {
    getSpecialities,
    getSpecilitiesAndEmergenciesAssociatedWithMedicData
};
const medicRepository = require('../repositories/medicRepository');
const specialityRepository = require('../repositories/specialityRepository');

/**
 * 
 * @param {Number} medicId
 * @returns {Promise<MedicDataWithSpecilities | null>}
 */
const getMedicDataById = async (medicId)=>{
    const medic = await medicRepository.getMedicDataById(medicId); 
    const emergenciesSpecialities = await specialityRepository.getSpecilitiesAndEmergenciesAssociatedWithMedicData(medicId);

    return {
        id: medic.id,
        name: medic.name,
        lastname: medic.lastname,
        email: medic.email,
        telephone: medic.telephone,
        licence: medic.licence,
        idSpeciality: medic.idSpeciality,
        emergenciesSpecialities
    }

};



/**
 * @typedef {Object} SpecialityTypeEmergency
 * @property {Number} id
 * @property {Number} specialityId
 * @property {Number} emergencyTypeId
 * 
 */

// {id: number, name: number, email: string, telephone: string, licence: string, idSpeciality: number, }
/**
 * @typedef {Object} MedicDataWithSpecilities
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} telephone
 * @property {string} licence
 * @property {number} idSpeciality
 * @property {SpecialityTypeEmergency[]} emergenciesSpecialities
 */


module.exports = {
    getMedicDataById,
};
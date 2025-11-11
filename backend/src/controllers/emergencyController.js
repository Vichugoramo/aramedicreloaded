const emergencyRepository = require('../repositories/emergencyRepository');


const getAllEmergencies = async (req, res, next) => {
    try{
        const emergencyDataList = await emergencyRepository.findAllEmergencies();
        const emergencyList = emergencyDataList.map(convertEmergencyDataToEmergencyType);
        const response = {emergencyTypes: emergencyList};
        return res.json(response);
    }catch(error){
        return next(error);
    }
};


/**
 * 
 * @param {EmergencyData} emergencyData 
 * @returns {EmergencyType}
 */
function convertEmergencyDataToEmergencyType(emergencyData){
    return {
        id: emergencyData.id,
        name: emergencyData.nombre,
        description: emergencyData.descripcion
    };
}









 //* @param {EmergencyData} emergencyData 


 /**
  * @typedef {Object} EmergencyData
  * @property {number} id
  * @property {string} nombre
  * @property {string} descripcion
  */

 /**
  * @typedef {Object} EmergencyType
  * @property {number} id
  * @property {string} name
  * @property {string} description
  */

module.exports = {
    getAllEmergencies
};
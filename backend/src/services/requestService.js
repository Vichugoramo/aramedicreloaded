const requestRepository = require('../repositories/requestRepository');



const typeOfRequest = Object.freeze({
    PENDIENTE: 'Pendiente',
    ASIGNADA: 'Asignada',
    TERMINADA: 'Terminada',
});




/**
* @param {UserConnected} userWhoCreatesTheRequest
* @param {{emergencyTypeId: number, notes: string, initialLocation: string}} newRequestData
*/
const createNewRequest = async (userWhoCreatesTheRequest, newRequestData) => {
    const initialLocation =newRequestData.initialLatitude+','+newRequestData.initialLongitude;
    newRequestData.initialLocation = initialLocation;
    const request = await requestRepository.createRequest(userWhoCreatesTheRequest.userId, newRequestData);
    return request;
};


/**
 * 
 * @param {Number} patientId 
 * @returns {Promise<Request | null>}
 */
const getPendingRequestByPatientId = async (patientId) => {
    return await requestRepository.getPendingRequestByPatientId(patientId);
};




/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<Request | null>}
 */
const getPendingRequestByMedicId = async (medicId) => {
    return await requestRepository.getPendingRequestByMedicId(medicId);
};



/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<Request | null>}
 */
const getAssignedRequestByMedicId = async (medicId) => {
    return await requestRepository.getAssignedRequestByMedicId(medicId);
};



/**
 * 
 * @param {Number} patientId 
 * @returns {Promise<Request | null>}
 */
const getAssignedRequestByPatientId = async (patientId) => {
    return await requestRepository.getAssignedRequestByPatientId(patientId);
};



/**
 * 
 * @param {Number} idRequest
 * @returns {Promise<Void>}
 */
const endRequest = async (idRequest) => {
    return await requestRepository.endRequest(idRequest);
};


/**
 * 
 * @returns {Promise<Request[]>}
 */
const getAllPendingRequests = async () => { 
    return await requestRepository.getAllPendingRequests();
};


/**
 * 
 * @param {Number} medicId 
 * @param {Number} requestId 
 * @returns {Promise<Void>}
 */
const assignMedicToRequest = async (medicId, requestId) => {
    return await requestRepository.assignMedicToRequest(medicId, requestId);
};





/**
 * @typedef {Object} UserConnected
 * @property {string} type
 * @property {Number} userId
 * @property {Socket} socket
 * @property {String} location
 */



/**
 * @typedef {Object} Request
 * @property {Number} id
 * @property {Number} emergencyId
 * @property {Number} medicId
 * @property {Number} patientId
 * @property {Date} date
 * @property {string} initialLocation
 * @property {string} status
 * @property {string} notes
 * 
 */






module.exports = {
    createNewRequest,
    getPendingRequestByPatientId,
    getPendingRequestByMedicId,
    getAssignedRequestByMedicId,
    getAssignedRequestByPatientId,
    endRequest,
    getAllPendingRequests,
    assignMedicToRequest,
};
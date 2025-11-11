const db = require('../config/db').getDB();



const typeOfRequest = Object.freeze({
    PENDIENTE: 'Pendiente',
    ASIGNADA: 'Asignada',
    TERMINADA: 'Terminada',
});


/**
 * 
 * @param {Number} requestId 
 * @returns {Promise<Request | null>}
 */
const getRequestById = async (requestId) => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE id = ?', [requestId]);
    const request = result[0];
    return !request ? null : {
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    };
};


/**
 * 
 * @returns {Promise<Request[]>}
 */
const getAllPendingRequests = async () => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE estado = ?', [typeOfRequest.PENDIENTE]);
    return result.map(request => ({
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    }));
};


/**
 * 
 * @param {Number} patientId 
 * @param {{emergencyTypeId: number, notes: string, initialLocation: 'latitude,longitude'}} newRequestData
 */
const createRequest = async (patientId, newRequestData) => {

    const query = 'INSERT INTO solicitudes (id_emergencia, id_paciente, fecha, ubicacion_inicial, estado, notas) VALUES (?, ?, ?, ?, ?, ?)';
    const dateRequest = getDateTime();
    const [result] = await db.query(query, [newRequestData.emergencyTypeId, patientId, dateRequest, newRequestData.initialLocation, typeOfRequest.PENDIENTE, newRequestData.notes]);
    return {
        id: result.insertId,
        emergencyId: newRequestData.emergencyTypeId,
        medicId: null,
        patientId: patientId,
        date: dateRequest,
        initialLocation: newRequestData.initialLocation,
        status: typeOfRequest.PENDIENTE,
        notes: newRequestData.notes
    };
};


/**
 * 
 * @param {Number} patientId 
 * @returns {Promise<Request | null>}
 */
const getPendingRequestByPatientId = async (patientId) => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE id_paciente = ? AND estado = ?', [patientId, typeOfRequest.PENDIENTE]);
    const request = result[0];
    return !request ? null : {
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    };
};



/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<Request | null>}
 */
const getPendingRequestByMedicId = async (medicId) => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE id_medico = ? AND estado = ?', [medicId, typeOfRequest.PENDIENTE]);
    const request = result[0];
    return !request ? null : {
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    };
};


/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<Request | null>}
 */
const getAssignedRequestByMedicId = async (medicId) => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE id_medico = ? AND estado = ?', [medicId, typeOfRequest.ASIGNADA]);
    const request = result[0];
    return !request ? null : {
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    };
};

/**
 * 
 * @param {Number} patientId 
 * @returns {Promise<Request | null>}
 */
const getAssignedRequestByPatientId = async (patientId) => {
    const [result] = await db.query('SELECT * FROM solicitudes WHERE id_paciente = ? AND estado = ?', [patientId, typeOfRequest.ASIGNADA]);
    const request = result[0];
    return !request ? null : {
        id: request.id,
        emergencyId: request.id_emergencia,
        medicId: request.id_medico,
        patientId: request.id_paciente,
        date: request.fecha,
        initialLocation: request.ubicacion_inicial,
        status: request.estado,
        notes: request.notas,
    };
};



/**
 * 
 * @param {Number} requestId 
 * @param {Number} medicId 
 * @returns {Promise<void>}
 */
const assignMedicToRequest = async (medicId, requestId) => {
    const query = 'UPDATE solicitudes SET id_medico = ?, estado = ? WHERE id = ?';
    await db.query(query, [medicId, typeOfRequest.ASIGNADA, requestId]);
}


/**
 * 
 * @param {Number} requestId 
 * @returns {Promise<void>}
 */
const endRequest = async (requestId) => {
    const query = 'UPDATE solicitudes SET estado = ? WHERE id = ?';
    await db.query(query, [typeOfRequest.TERMINADA, requestId]);
};


/**
 * 
 * @returns {string} Formato "YYYY-MM-DD HH:MM:SS"
 */
const getDateTime = () => {
    const now = new Date();

    // Obtener los componentes de la fecha
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Formatear la fecha en formato "YYYY-MM-DD HH:MM:SS"
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
};



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




/**
 * @typedef {Object} NewRequestData
 * @property {Number} emergencyTypeId
 * @property {string} notes
 * @property {string} initialLocation
 */






module.exports = {
    getRequestById,
    getAllPendingRequests,
    createRequest,
    getPendingRequestByPatientId,
    getPendingRequestByMedicId,
    getAssignedRequestByMedicId,
    getAssignedRequestByPatientId,
    endRequest,
    assignMedicToRequest

};
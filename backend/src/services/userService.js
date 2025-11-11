const { Socket, Server } = require("socket.io");
const patientRepository = require("../repositories/patientRepository");
const requestService = require("./requestService");
const medicService = require("./medicService");
const medicRepository = require('../repositories/medicRepository');
const distanceCalculator = require("../utils/distanceCalculator");
const TIME_TO_VERIFY_IF_REQUESTS_CAN_BE_ASSIGNED = 1700; // 1.7 seconds
// const TIME_TO_VERIFY_IF_REQUESTS_CAN_BE_ASSIGNED = 7000; // 7 seconds
// const TIME_TO_VERIFY_IF_REQUESTS_CAN_BE_ASSIGNED = 20_000; // 20 seconds
/**
 * @type {ListOfUsers}
 */
const users = {
    amountOfUsers: 0,
    patients: [],
    medics: []
};


let isProcessing = false;
setInterval(async () => {
    if (isProcessing) return; isProcessing = true; console.log('matching...')
    let pendingRequests = await requestService.getAllPendingRequests();
    pendingRequests = pendingRequests.sort((a, b) => a.date - b.date);

    for (const pendingRequest of pendingRequests) {

        // just connected medics that are not assigned to a request are candidates
        const medicCandidates = (await getAllConnectedMedics()).filter(candidate => (!candidate?.patientAssigned));



        const candidates = []
        for (const candidate of medicCandidates) {
            const requestAssigned = await requestService.getAssignedRequestByMedicId(candidate.userId);
            if (!requestAssigned) { // if the medic is not assigned to a request yet
                
                const medic = await medicService.getMedicDataById(candidate.userId);
                medic.emergenciesSpecialities.map(e => e.emergencyTypeId).includes(pendingRequest.emergencyId) ? candidates.push(medic) : null;
            }
        }

        if (candidates.length <= 0) {
            continue;
        }
        const patientConnected = users.patients.find(p => p.userId === pendingRequest.patientId);
        let pendingRequestCoordinates = { latitude:pendingRequest?.initialLocation?.split(',')[0], longitude: pendingRequest?.initialLocation?.split(',')[1] };

        let chosenMedic = await findClosestMedic(candidates, patientConnected?.location? {latitude: patientConnected.location.currentLatitude, longitude: patientConnected.location.currentLongitude} : {latitude: pendingRequestCoordinates.latitude , longitude: pendingRequestCoordinates.longitude});
        if (!chosenMedic) {
            continue;
        }

        await requestService.assignMedicToRequest(chosenMedic.userId, pendingRequest.id);
        
        const patiendData = await patientRepository.getPatientById(pendingRequest.patientId);
        const messageToMedic = generateMessageFromCounterpartData({ type: 'PACIENTE', data: patiendData });
        messageToMedic.notes = pendingRequest.notes;
        messageToMedic.requestTimestamp = pendingRequest.date.getTime();
        messageToMedic.emergencyTypeId = pendingRequest.emergencyId;
        chosenMedic.socket.emit('receiveCounterpartData', messageToMedic);

        if (patientConnected) {
            await setAssignedPatientToMedic(patientConnected, chosenMedic);
            await setAssignedPatientToMedic(patientConnected, chosenMedic); // just one should be enough but just in case it fails
            const medicData = await medicRepository.getMedicById(chosenMedic.userId);
            const messageToPatient = generateMessageFromCounterpartData({ type: 'MEDICO', data: medicData });
            patientConnected.socket.emit('receiveCounterpartData', messageToPatient);
        }

        
    };
    isProcessing = false;
}, TIME_TO_VERIFY_IF_REQUESTS_CAN_BE_ASSIGNED);




/**
 * @param {User} user Los datos del usuario que se intenta conectar. type y userId
 * @param {Socket} socket El objeto del socket que se intenta conectar
 * @returns {Promise<void>}
 * 
 * @description Registra la conexion de un usuario en la lista de usuarios conectados, si tiene una solicitud 'Pendiente'
 * los respectivos datos de cada usuario se enviarán a los eventos 'receiveCounterpartData' de cada usuario
 */
const registerUserConnection = async (user, socket) => {

    const userConnected = await sameUserAlreadyConnected(user);
    if (userConnected) {
        socket.emit('error', 'Usuario ya conectado');
        socket.disconnect(); // disconnect the user that is trying to connect
        await removeConnectedUser(userConnected, 'error', 'Sesion cerrada por intento de duplicidad de sesion');
        return;
    }

    const newUser = { type: user.type, userId: user.userId, location: user.location, socket};
    if (user.type === 'MEDICO') { // this could be handled with specific methods for each type of user to themself add to the list of users
        users.medics.push(newUser);
    } else if (user.type === 'PACIENTE') {
        users.patients.push(newUser);
    }
    users.amountOfUsers++;
    ///
    console.log(JSON.stringify(users, (key, value) => {
        if (key === 'socket') return value?.id; // Excluir la propiedad 'socket'
        if (key === 'medicAssigned' || key === 'patientAssigned') return value?.userId;
        return value;
    }));
    ///
};




/**
 * 
 * @returns {Promise<UserConnected[]>}
 */
const getAllConnectedPatients = async () => {
    return [...users.patients];
};

/**
 * 
 * @returns {Promise<UserConnected[]>}
 */
const getAllConnectedMedics = async () => {
    return [...users.medics];
};


/**
 * 
 * @returns {Promise<UserConnected[]>}
 */
const getAllConnectedUsers = async () => {
    return [...users.medics, ...users.patients];
};


/**
 * 
 * @param {Number} patientId 
 * @returns {Promise<PatientConnected | undefined>}
 */
const getConnectedPatientById = async (patientId) => {
    return { ...users.patients.find(p => p.userId === patientId) };
};

/**
 * 
 * @param {Number} medicId 
 * @returns {Promise<MedicConnected | undefined>}
 */
const getConnectedMedicById = async (medicId) => {
    return { ...users.medics.find(m => m.userId === medicId) };
};


/**
 * 
 * @param {UserConnected} userConnected
 * @param {string} [typeOfMessage='alert'] - Tipo de mensaje que se le enviara al usuario, por defecto es 'alert'
 * @param {string} [message='Sesion cerrada'] - Mensaje a enviar al usuario, por defecto es 'Sesion cerrada'
 * @returns {Promise<void>}
 */
const removeConnectedUser = async (userConnected, typeOfMessage = 'alert', message = 'Sesion cerrada') => {
    // this if's could be handled with specific methods for each type of user to themself remove from the list of users
    if (userConnected.type === 'MEDICO') {
        users.medics = users.medics.filter(u => u.userId !== userConnected.userId);
        patient = users.patients.find(p => p?.medicAssigned?.userId === userConnected.userId);
        if (patient) {
            patient.medicAssigned = null;
        }
    } else {
        users.patients = users.patients.filter(u => u.userId !== userConnected.userId);
        medic = users.medics.find(m => m?.patientAssigned?.userId === userConnected.userId);
        if (medic) {
            medic.patientAssigned = null;
        }
    }
    userConnected.socket.emit('alert', message);
    userConnected.socket.disconnect();

    users.amountOfUsers--;
};


/**
 * 
 * @param {User} user 
 * @returns {Promise<UserConnected | undefined>}
 */
const sameUserAlreadyConnected = async (user) => {
    const userConnected = [
        ...users.medics,
        ...users.patients
    ].find(u => u.userId === user.userId);
    return userConnected;
};



/**
 * 
 * @param {PatientConnected} patient 
 * @param {MedicConnected} medic 
 */
const setAssignedPatientToMedic = async (patient, medic) => {
    const patientConnected = users.patients.find(p => p.userId === patient.userId);
    const medicConnected = users.medics.find(m => m.userId === medic.userId);

    patientConnected ? patientConnected.medicAssigned = medicConnected : null;
    medicConnected ? medicConnected.patientAssigned = patientConnected : null;

    medic.patientAssigned = patientConnected;
    patient.medicAssigned = medicConnected;
}


const setAssignedMedicToPatient = async (medic, patient) => {
    const patientConnected = users.patients.find(p => p.userId === patient.userId);
    const medicConnected = users.medics.find(m => m.userId === medic.userId);

    patientConnected.medicAssigned = medicConnected;
    medicConnected.patientAssigned = patientConnected;

    medic.patientAssigned = patientConnected;
    patient.medicAssigned = medicConnected;
}


/**
 * 
 * @param {UserConnected} userConnected
 * @param {String} location 
 */
const updateLocation = async (userConnected, location) => {
    userConnected.location = location

    if (userConnected.type === 'MEDICO') {
        users.medics.find(m => m.userId === userConnected.userId).location = location;
    } else {
        users.patients.find(p => p.userId === userConnected.userId).location = location;
    }
};


/**
 * 
 * @param {UserConnected} userConnected 
 */
const removeRelation = (userConnected) => {
    if (userConnected.type === 'MEDICO') {
        const currentMedic = users.medics.find(m => m.userId === userConnected.userId);
        const currentPatient = users.patients.find(p => p.userId === currentMedic.patientAssigned.userId);

        if (currentMedic?.patientAssigned) {
            currentMedic.patientAssigned.medicAssigned = null;
        }

        if (currentPatient?.medicAssigned) {
            currentPatient.medicAssigned.patientAssigned = null;
        }

        currentMedic.patientAssigned = null;
    } else if (userConnected.type === 'PACIENTE') {
        const currentPatient = users.patients.find(p => p.userId === userConnected.userId);
        const currentMedic = users.medics.find(m => m.userId === currentPatient.medicAssigned.userId);

        if (currentPatient?.medicAssigned) {
            currentPatient.medicAssigned.patientAssigned = null;
        }

        if (currentMedic?.patientAssigned) {
            currentMedic.patientAssigned.medicAssigned = null;
        }

        currentPatient.medicAssigned = null;
    }
};






/**
 * 
 * @param {MedicDataWithSpecilities[]} medics 
 * @param {{latitude: Number, longitude: Number}} targetLocation
 * @returns {Promise<MedicConnected | null>}
 */
const findClosestMedic = async (medics, targetLocation) => {

    
    let closest = null;
    let distance = 0;

    let requestLatitude = targetLocation.latitude;
    let requestLongitude = targetLocation.longitude;

    for (const medic of medics) {
        const medicConnected = users.medics.find(m => m.userId === medic.id);
        if (!medicConnected) continue;
        if (!medicConnected.location) continue;
        if (!closest) {
            closest = medicConnected;
            distance = distanceCalculator(
                medicConnected?.location?.currentLatitude,
                medicConnected?.location?.currentLongitude,
                requestLatitude,
                requestLongitude
            );
            continue;
        } else {
            const newDistance = distanceCalculator(
                medicConnected?.location?.currentLatitude,
                medicConnected?.location?.currentLongitude,
                requestLatitude,
                requestLongitude
            );
            if (newDistance < distance) {
                closest = medicConnected;
                distance = newDistance;
            }
        }

    }
    return closest;

};


















/**
 * 
 * @param {{data: (MedicData | PatientData) type: string}} recipientData 
 */
const generateMessageFromCounterpartData = (recipientData) => {
    if (recipientData.type == 'MEDICO') {

        return {
            fullname: recipientData.data.name + ' ' + recipientData.data.lastname,
            licence: recipientData.data.licence,
            speciality: recipientData.data.speciality,
            telephone: recipientData.data.telephone
        }
    } else if (recipientData.type == 'PACIENTE') {
        return {
            fullname: recipientData.data.name + ' ' + recipientData.data.lastname,
            height: recipientData.data.height,
            weight: recipientData.data.weight,
            age: recipientData.data.age,
            sex: recipientData.data.sex,
            telephone: recipientData.data.telephone,
        }
    }
    return { message: 'Usario no valido' }

};



/**
 * 
 * @param {MedicConnected} MEDIC 
 */


/**
 * @typedef {Object} Location
 * @property {Number} currentLatitudelatitude
 * @property {Number} currentLongitude
 */

/**
 * @typedef {Object} User
 * @property {string} type
 * @property {Number} userId
 * @property {string} token
 * @property {Location | undefined} location
 */


/**
 * @typedef {Object} UserConnected
 * @property {string} type
 * @property {Number} userId
 * @property {Socket} socket
 * @property {String} location
 */

/**
 * @class
 * @extends {UserConnected}
 * @typedef {Object} MedicConnected
 * @property {string} type
 * @property {Number} userId
 * @property {Socket} socket
 * @property {UserConnected} patientAssigned
 * @property {{currentLatitude: Number, currentLongitude: Number}} location
 */

/**
 * @class
 * @extends {UserConnected}
 * @typedef {Object} PatientConnected
 * @property {string} type
 * @property {Number} userId
 * @property {Socket} socket
 * @property {UserConnected} medicAssigned
 * @property {{currentLatitude: Number, currentLongitude: Number}} location
 */

/**
 * 
 * @param {PatientConnected} ejemplo 
 */

/**
 * @typedef {Object} ListOfUsers
 * @property {number} amountOfUsers
 * @property {PatientConnected[]} patients
 * @property {MedicConnected[]} medics
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
    registerUserConnection,
    getAllConnectedPatients,
    removeConnectedUser,
    getAllConnectedMedics,
    getAllConnectedUsers,
    getConnectedPatientById,
    getConnectedMedicById,
    setAssignedPatientToMedic,
    setAssignedMedicToPatient,
    updateLocation,
    removeRelation

};
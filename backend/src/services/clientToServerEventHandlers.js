const { Socket, Server } = require('socket.io');
const userService = require('./userService');
const requestService = require('./requestService');
const medicRepository = require('../repositories/medicRepository');
const patientRepository = require('../repositories/patientRepository');

const { saveReportToS3 } = require('../utils/s3Helper');
/**
 * 
 * @param {UserConnected} userConnected 
 * @returns {Promise<void>}
 */
const sendPendingRequestIfExist = async (userConnected) => {

    let dataToSend = {};
    if (userConnected.type == 'PACIENTE') {
        const requestPending = await requestService.getPendingRequestByPatientId(userConnected.userId);
        if (requestPending) {
            userConnected.socket.emit('isRequestCreated', {}); // indicate to the user that he has a request pending
            return;
        }

        const requestAssigned = await requestService.getAssignedRequestByPatientId(userConnected.userId);
        if (!requestAssigned) { // this point mean there are not request pending nor assigned, so return. (user has not made any request)
            return;
        }
        userConnected.socket.emit('isRequestCreated', {}); // send a temporal message while the request data is being sent

        const medicData = await medicRepository.getMedicById(requestAssigned.medicId);
        dataToSend = generateMessageFromCounterpartData({ type: 'MEDICO', data: medicData });
        userConnected.socket.emit('receiveCounterpartData', dataToSend);


        const medicAssigned = (await userService.getAllConnectedMedics()).find(medic => medic.userId == medicData.id);
        if (medicAssigned) {
            userService.setAssignedMedicToPatient(medicAssigned, userConnected);
            medicAssigned?.socket?.emit('updateCounterpartLocation', {isOnline: true, ...userConnected.location});
            userConnected.socket.emit('updateCounterpartLocation', {isOnline: true, ...medicAssigned.location});
            return;
        }
        userConnected.socket.emit('updateCounterpartLocation', {isOnline: false});

    } else if (userConnected.type == 'MEDICO') {
        const requestAssigned = await requestService.getAssignedRequestByMedicId(userConnected.userId);
        if (!requestAssigned) return;
        const patientData = await patientRepository.getPatientById(requestAssigned.patientId);
        dataToSend = generateMessageFromCounterpartData({ type: 'PACIENTE', data: patientData });
        dataToSend.notes = requestAssigned.notes;
        userConnected.socket.emit('receiveCounterpartData', {...dataToSend, requestTimestamp: requestAssigned.date.getTime(), emergencyTypeId: requestAssigned.emergencyId});

        const patientAssigned = (await userService.getAllConnectedPatients()).find(patient => patient.userId == patientData.id);
        if (patientAssigned) {
            userService.setAssignedPatientToMedic(patientAssigned, userConnected);
            patientAssigned?.socket?.emit('updateCounterpartLocation', {isOnline: true, ...userConnected.location});
            userConnected.socket.emit('updateCounterpartLocation', {isOnline: true, ...patientAssigned.location});
            return;
        };
        userConnected.socket.emit('updateCounterpartLocation', {isOnline: false});
    }

};



/**
 * 
 * @param {Socket} socket 
 * @param {Server} io 
 * @param {User} user
 * @returns {Object}
 * 
 */
module.exports = async (socket, io, user) => {
    const userConnected = { ...user, socket };

    await sendPendingRequestIfExist(userConnected); // here users are related each other, if they are connected both

    return {
        // all users
        onDisconnect: () => {
            return async () => {
                console.log('user disconnected');
                await userService.removeConnectedUser(userConnected);
                if(userConnected.type == 'MEDICO'){
                    const patient = await userService.getConnectedPatientById(userConnected?.patientAssigned?.userId);
                    if(patient){
                        patient.socket?.emit('alert', 'El medico se ha desconectado');
                        patient.socket?.emit('updateCounterpartLocation', {isOnline: false});
                    }
                }else if(userConnected.type == 'PACIENTE'){
                    const medic = await userService.getConnectedMedicById(userConnected?.medicAssigned?.userId);
                    if(medic){
                        medic.socket?.emit('alert', 'El paciente se ha desconectado');
                        medic.socket?.emit('updateCounterpartLocation', {isOnline: false});
                    }
                }
            }
        },

        sendMessage: () => {
            return async (message) => {

                let user = null;
                
                if(userConnected.type == 'MEDICO'){
                    user = await userService.getConnectedMedicById(userConnected.userId);
                    if(user?.patientAssigned){
                        user.patientAssigned.socket.emit('receiveMessage', message);
                        return;
                    }
                }else if(userConnected.type == 'PACIENTE'){
                    user = await userService.getConnectedPatientById(userConnected.userId);
                    if(user?.medicAssigned){
                        user.medicAssigned.socket.emit('receiveMessage', message);
                        return;
                    }
                }
                userConnected.socket.emit('alert', 'No tienes un usuario asignado');
            }
        },
        updateUserLocation: () => {

            return async (location) => {
                let currentUser = null;

                if (userConnected.type == 'MEDICO') {
                    currentUser = await userService.getConnectedMedicById(userConnected.userId);
                    
                    if (currentUser?.patientAssigned) {
                        currentUser?.patientAssigned?.socket?.emit('updateCounterpartLocation', {...location, isOnline: true});
                    }
                }else if(userConnected.type == 'PACIENTE'){
                    currentUser = await userService.getConnectedPatientById(userConnected.userId);
                    if(currentUser?.medicAssigned){
                        currentUser?.medicAssigned?.socket?.emit('updateCounterpartLocation', {...location, isOnline: true});
                    }
                }
                await userService.updateLocation(currentUser, location);
            };

        },


        // patients
        createRequest: () => {
            /**
            * @param {{emergencyTypeId: number, notes: string, initialLocation}} newRequestData
            */
            return async (newRequestData) => {

                const oldRequest = await requestService.getPendingRequestByPatientId(userConnected.userId);
                if (oldRequest) {
                    userConnected.socket.emit('error', 'Ya tienes una solicitud pendiente');
                    return;
                }
                const newRequest = await requestService.createNewRequest(userConnected, newRequestData);
                userConnected.socket.emit('isRequestCreated', {});
            };
        },

        // medics

        endRequest: () => {
            return async () =>{
                const request = await requestService.getAssignedRequestByMedicId(userConnected.userId);

                if(!request){
                    userConnected.socket.emit('error', 'No tienes una solicitud asignada');
                    return;
                }
                await requestService.endRequest(request.id);
                userConnected.socket.emit('isRequestCompleted', {});

                const patient = await userService.getConnectedPatientById(request.patientId);
                patient?.socket?.emit('isRequestCompleted', {});

                userService.removeRelation(userConnected);
                
                const reportData = await generateReportData(request);
                saveReportToS3(reportData);
            };
        }


    };
};



/**
 * 
 * @param {Request} request 
 * @returns {Promise<ReportData>}
 */
const generateReportData = async (request)=>{
    const medicData = await medicRepository.getMedicById(request.medicId);
    const patientData = await patientRepository.getPatientById(request.patientId);

    return {
        id: request.id,
        emergencyId: request.emergencyId,
        medicName: medicData.lastname + ' ' + medicData.name,
        patientName: patientData.lastname + ' ' + patientData.name,
        date: request.date,
        initialLocation: request.initialLocation,
        notes: request.notes
    }
}




/**
 * 
 * @param {{data: (MedicData | PatientData) type: string}} recipientData 
 */
const generateMessageFromCounterpartData = (recipientData) => {
    if (recipientData.type == 'MEDICO') {

        return {
            fullname: recipientData.data.lastname + ' ' + recipientData.data.name,
            licence: recipientData.data.licence,
            speciality: recipientData.data.speciality,
            telephone: recipientData.data.telephone
        }
    } else if (recipientData.type == 'PACIENTE') {
        return {
            fullname: recipientData.data.lastname + ' ' + recipientData.data.name,
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
 * @typedef {Object} User
 * @property {string} type
 * @property {Number} userId
 */

/**
 * @typedef {Object} UserConnected
 * @property {string} type
 * @property {Number} userId
 * @property {Socket} socket
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
 * @typedef {Object} MedicData
 * @property {number} id
 * @property {string} name
 * @property {string} lastname
 * @property {string} email
 * @property {string} telephone
 * @property {string} licence
 * @property {string} speciality
 * 
 */






/**
 * @typedef {Object} PatientData
 * @property {Number} id
 * @property {string} name
 * @property {string} lastname
 * @property {string} email
 * @property {string} telephone
 * @property {string} curp
 * @property {Number} age
 * @property {'M' | 'F'} sex,
 * @property {Number} weight
 * @property {Number} height
 * 
 */



/**
 * @typedef {Object} ReportData
 * @property {Number} id
 * @property {Number} emergencyId
 * @property {String} medicName
 * @property {String} patientName
 * @property {Date} date
 * @property {String} initialLocation
 * @property {String} notes
 * 
 * 
 */


const { Socket, Server } = require("socket.io");
const { getTypeAndIdFromToken } = require('../utils/tokenUtils');
const userService = require('../services/userService');


/**
* @param {Server} io
*/
const onConnection = (io) =>{
    console.log("user connected");

    /**
    * @param {Socket} socket - El objeto socket que maneja la conexión de un cliente.
    */
    return async (socket) => {
        const { token, currentLatitude, currentLongitude } = socket.handshake.auth;
        const user = authenticateUser(socket, token);
        user.location = { currentLatitude, currentLongitude };
        user.token = token;
        if(!user){
            return;
        }
        await handlerNewUserConnection(user, socket, io);
    };
};



/**
 * 
 * @param {Socket} socket 
 * @param {User} user 
 */
const handlerNewUserConnection = async (user, socket, io) => {    
    // maybe this method should be return a instance of a specific user (Medic, Patient, etc) and this instance should have all the events that the user can do
    await userService.registerUserConnection(user, socket); // add to the list of users connected
    
    const clientToServerEventHandlers = await require('../services/clientToServerEventHandlers')(socket, io, user); // get the event handlers file which contain all the events that the user can do

    // every type of user has different events, this can be implemented with a UserFactory, every user has a different event handler, and unique method 
    if(user.type == 'MEDICO'){// could be invoked for different types of users, and every type of user initialize their own events
        handlerMedicConnection(socket, user); // maybe this can be deleted, and all events put in every if
        socket.on('endRequest', clientToServerEventHandlers.endRequest());
        
    }else if(user.type == 'PACIENTE'){
        handlerPatientConnection(socket, user);
        socket.on('createRequest', clientToServerEventHandlers.createRequest());
    }


    //// events that are common for all users
    socket.on('updateUserLocation', clientToServerEventHandlers.updateUserLocation());
    socket.on('sendMessage', clientToServerEventHandlers.sendMessage());
    socket.on('disconnect', clientToServerEventHandlers.onDisconnect());
};



/**
 * 
 * @param {Socket} socket 
 * @param {string} token 
 * @returns {User | null}
 */
const authenticateUser = (socket, token) => {
    try{
        user = getTypeAndIdFromToken(token);
        return user;
    }catch(error){
        console.log('user dont have permission');
        socket.emit('error', 'No tienes permiso para conectarte, token invalido');
        socket.disconnect();
        return null;
    }
};


/**
 * 
 * @param {Socket} socket 
 * @param {User} user 
 * @param {Server} io 
 * 
 * Se definen los eventos que un medico puede disparar
 */
const handlerMedicConnection =  (socket, user, io) => {
    // add all the process that a medic can do, add all that process in serivices folder
}


/**
 * 
 * @param {Socket} socket 
 * @param {User} user 
 * @param {Server} io 
 * 
 * Se definen los eventos que un paciente puede disparar
 */
const handlerPatientConnection =  (socket, user, io) => {
    // add all the process that a patient can do, add all that process in serivices folder
}

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



module.exports = onConnection;
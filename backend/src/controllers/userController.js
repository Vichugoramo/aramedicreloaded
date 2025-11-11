const userRepository = require('../repositories/userRepository');


const messages = {
    notFound: { message: "Not Found" }
}

const getProfileData = async (req, res, next) => {
    try {
        const id = req.user.userId;
        const userData = await userRepository.getUserAndSpecificDataById(id);

        if (!userData) {
            return res.status(404).json(messages.notFound);
        }

        let user = null;
        if (userData.tipo == 'medico') {
            user = createMedicUserFromUserData(userData);
        } else if (userData.tipo == 'paciente') {
            user = createPatientUserFromData(userData);
        }

        return res.json(user);

    } catch (error) {
        next(error);
    }
};



/**
 * @param {medicoData} userData
 * @returns {Medico}
 */
function createMedicUserFromUserData(userData, includePassword = false) {
    const medic = {
        id: userData.id,
        name: userData.nombre,
        lastname: userData.apellidos,
        email: userData.email,
        telephone: userData.telefono,
        licence: userData.cedula,
        speciality: userData.especialidad
    };
    if (includePassword) {
        medic.password = userData.password;
    }
    return medic;
}

/**
 * @param {pacienteData} userData
 * @returns {Paciente}
 */

function createPatientUserFromData(userData, includePassword = false) {
    const pacient = {
        id: userData.id,
        name: userData.nombre,
        lastname: userData.apellidos,
        email: userData.email,
        telephone: userData.telefono,
        curp: userData.curp,
        age: userData.edad,
        sex: userData.sexo,
        weight: userData.peso,
        height: userData.estatura
    };
    if (includePassword) {
        pacient.password = userData.password;
    }
    return pacient;
};


/**
 * @typedef {Object} Medico
 * @property {number} id
 * @property {string} name
 * @property {string} lastname
 * @property {string} email
 * @property {string} telephone
 * @property {string} licence
 * @property {string} speciality
 * @property {string} password
 * 
 */

/**
 * 
 * @typedef {Object} Paciente
 * @property {number} id
 * @property {string} name
 * @property {string} lastname
 * @property {string} email
 * @property {string} telephone
 * @property {string} curp
 * @property {number} age
 * @property {'M' | 'F'} sex
 * @property {number} weight
 * @property {number} height
 * @property {string} password
 * 
 */


/**
 * @typedef {Object} medicoData
 * @property {number} id
 * @property {string} nombre
 * @property {string} apellidos
 * @property {string} email
 * @property {string} telefono
 * @property {string} cedula
 * @property {string} especialidad
 * @property {'medico'} tipo
 */
/**
 * @typedef {Object} pacienteData
 * @property {number} id
 * @property {string} nombre
 * @property {string} apellidos
 * @property {string} email
 * @property {string} telefono
 * @property {string} curp
 * @property {number} edad
 * @property {'M' | 'F'} sexo
 * @property {number} peso
 * @property {number} estatura
 * @property {'paciente'} tipo
 */
module.exports = {
    getProfileData
};
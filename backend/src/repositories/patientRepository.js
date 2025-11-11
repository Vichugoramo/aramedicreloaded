const db = require('../config/db').getDB();
const { hashPassword, generateToken } = require('../utils/tokenUtils');

/**
 * 
 * @param {{name: string, lastname: string, password: string, curp: string, age: number, sex: 'M' | 'F', height: number, weight: number, email: string, telephone: string}} patient 
 * los datos del paciente a crear
 * @returns {Promise<{id: number, name: string, lastname: string, curp: string, age: number, sex: 'M' | 'F', height: number, weight: number, email: string, telephone: string}>}
 * los datos del paciente creado
 */
const createPatient = async (patient) => { 

    const passwordHashed = await hashPassword(patient.password);
    const insertUserQuery = `
        INSERT INTO usuarios(nombre, apellidos, email, telefono, password) VALUES(?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(insertUserQuery, [patient.name, patient.lastname, patient.email, patient.telephone, passwordHashed]);
    const insertedId = result.insertId;

    const insertPacientQuery = `
        INSERT INTO pacientes(id_usuario, curp, edad, sexo, peso, estatura) VALUES(?, ?, ?, ?, ?, ?)
    `;
    try{
        await db.query(insertPacientQuery, [insertedId, patient.curp, patient.age, patient.sex, patient.weight, patient.height]);
    }catch{
        await db.query(`DELETE FROM usuarios WHERE id = ?`, [insertedId]);
        throw new Error("Error creating patient");
    }
    return { id: insertedId, name: patient.name, lastname: patient.lastname, curp: patient.curp, age: patient.age}
};


/**
 * 
 * @param {Number} id 
 * @returns {Promise<PatientData>}
 */
const getPatientById = async (id) => {
    const query = `
        SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, p.curp, p.edad, p.sexo, p.peso, p.estatura
        FROM usuarios u
        INNER JOIN pacientes p ON p.id_usuario = u.id
        where p.id_usuario = ?
    `;
    const [result] = await db.query(query, [id]);
    const patient = result[0];
    
    return {
        id: patient.id,
        name: patient.nombre,
        lastname: patient.apellidos,
        email: patient.email,
        telephone: patient.telefono,
        curp: patient.curp,
        age: patient.edad,
        sex: patient.sexo,
        weight: patient.peso,
        height: patient.estatura
    };
};




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


module.exports = {
    createPatient,
    getPatientById
};
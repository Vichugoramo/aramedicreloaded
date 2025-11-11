const db = require('../config/db').getDB();


/**
 * Obtiene los datos del usuario y su tipo (medico o paciente) basado en el correo electrónico.
 * 
 * @param {string} email - El correo electrónico del usuario.
 * @returns {Promise<{id: number, telefono: string,nombre:string, apellidos:string, email: string, password: string, tipo: string}> | null} -
 * - Un objeto que contiene los datos del usuario (id, email, password) y el tipo (medico o paciente) o null si no se encuentra el usuario.
 * @throws {Error} Si no se encuentra el usuario o hay un error en la consulta.
 */
const getUserAndTypeOfUserByEmail = async (email) => {

    const query = `
        SELECT
            usuarios.id, 
            usuarios.nombre,
            usuarios.apellidos,
            usuarios.email,
            usuarios.telefono,
            usuarios.password,
            COALESCE(
                (SELECT 'MEDICO' FROM medicos WHERE medicos.id_usuario = usuarios.id LIMIT 1), 
                (SELECT 'PACIENTE' FROM pacientes WHERE pacientes.id_usuario = usuarios.id LIMIT 1)
            ) AS tipo
        FROM 
        usuarios 
        WHERE 
        usuarios.email = "${email}"
    `;

    const [rows] = await db.query(query);
    const user = rows[0];
    
    return user;
    
};




/**
 * 
 * @param {number} id 
 * @returns {Promise<(pacienteData | medicoData)> }
 * retorna un objeto con los datos del usuario y su tipo (paciente o medico)
 */
const getUserAndSpecificDataById = async (id) => {
    const query = "CALL get_user_fields_by_id(?)";
    const user = (await db.query(query, [id]))[0][0][0];
    return user;
};








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
    getUserAndTypeOfUserByEmail,
    getUserAndSpecificDataById
};
const db = require('../config/db').getDB();
const { hashPassword } = require('../utils/tokenUtils');



/**
 * 
 * @param {{name: string, lastname: string, password: string, telephone: string, email: string, licence: string, idSpeciality: number}} medic 
 * los datos del médico a crear
 * @returns {Promise<{id: number, name: string, lastname: string, telephone: string, email: string, licence: string, idSpeciality: number}>}
 * los datos del médico creado
 * @throws {Error} si hay un error en la consulta
 */
const createMedic = async (medic) => {

    const passwordHashed = await hashPassword(medic.password);
    const insertUserQuery = `
        INSERT INTO usuarios(nombre, apellidos, email, telefono, password) VALUES(?, ?, ?, ?, ?)
    `;
    let insertedId = null;
    try{
        const [result] = await db.query(insertUserQuery, [medic.name, medic.lastname, medic.email, medic.telephone, passwordHashed]);
        insertedId = result.insertId;
        const insertMedicQuery = `
            INSERT INTO medicos(id_usuario, cedula, id_especialidad) VALUES(?, ?, ?)
        `;
        await db.query(insertMedicQuery, [insertedId, medic.licence, medic.idSpeciality]);
        return { id: insertedId, name: medic.name, lastname: medic.lastname, telephone: medic.telephone, email: medic.email, licence: medic.licence, idSpeciality: medic.idSpeciality };
    }catch(error){

        insertedId != null? db.query("DELETE FROM usuarios WHERE id = ?", [insertedId]): null;
    
        throw new Error("Error creating medic");
    }

};

/**
 * 
 * @param {Number} id 
 * @returns {Promise<{id: number, name: string, lastname: string, email: string, telephone: string, licence: string, speciality: string}>}
 */
const getMedicById = async (id) => {
    const query = `
        SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, m.cedula, e.nombre as especialidad
        FROM usuarios u
        INNER JOIN medicos m ON m.id_usuario = u.id
        INNER JOIN especialidades e ON m.id_especialidad = e.id
        where m.id_usuario = ?
    `;
    const [result] = await db.query(query, [id]);
    const medic = result[0];
    
    return {
        id: medic.id,
        name: medic.nombre,
        lastname: medic.apellidos,
        email: medic.email,
        telephone: medic.telefono,
        licence: medic.cedula,
        speciality: medic.especialidad
    };
};

/**
 * 
 * @param {Number} medicId
 * @returns {Promise<{id: number, name: number, lastname: string, email: string, telephone: string, licence: string, idSpeciality: number} | null>}
 */
const getMedicDataById = async (medicId)=>{

    const query = `
        SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, m.cedula, m.id_especialidad as especialidad
        FROM usuarios u
        INNER JOIN medicos m ON m.id_usuario = u.id
        where m.id_usuario = ?
    `;
    const [result] = await db.query(query, [medicId]);
    const medic = result[0];
    return !medic ? null : {
        id: medic.id,
        name: medic.nombre,
        lastname: medic.apellidos,
        email: medic.email,
        telephone: medic.telefono,
        licence: medic.cedula,
        idSpeciality: medic.especialidad
    }
};

module.exports = {
    createMedic,
    getMedicById,
    getMedicDataById

}
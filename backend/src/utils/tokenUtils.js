const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const timeToExpireToken = process.env.TIME_TO_EXPIRE_TOKEN;
const bcrypt = require('bcrypt');
const bcryptSalt = Number(process.env.BCRYPT_SALT);

/**
 * 
 * @param {string} userId el id del usuario
 * @param {"MEDICO" | "PACIENTE" | string} type el tipo de usuario
 * @returns {string} el token generado
 */
const generateToken = (userId, type) => {
    return jwt.sign({ userId, type }, JWT_SECRET, { expiresIn: timeToExpireToken });
};

/**
 * 
 * @param {string} password la contraseña a hashear
 * @returns {Promise<string>} la contraseña hasheada
 */
const hashPassword = async (password) => {
    return bcrypt.hash(password, bcryptSalt);
};


const getTypeAndIdFromToken = (token) => {
    const { type, userId } = jwt.verify(token, JWT_SECRET);
    return { type, userId };
};

module.exports = {
    generateToken,
    hashPassword,
    getTypeAndIdFromToken
};

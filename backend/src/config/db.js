const mysql = require('mysql2/promise');

/** @type mysql.Connection | null */
let db = null;

const connectDB = async () => {
    if (!db) {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('La conexión a la base de datos no ha sido establecida.');
    }
    return db;
};

module.exports = { connectDB, getDB };

// backend/config/db.js

// cargar las variables del archivo .env
require('dotenv').config();

// importar el paquete mysql2 para crear la conexión
const mysql = require('mysql2');

const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,         // Servidor donde está MySQL
  user: process.env.DB_USER,         // Usuario de MySQL
  password: process.env.DB_PASSWORD, // Contraseña de MySQL
  database: process.env.DB_NAME,     // Nombre de la base de datos
  port: process.env.DB_PORT,         // Puerto (por defecto MySQL usa 3306)
});


const db = connectionPool.promise();

module.exports = db;
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
  port: process.env.DB_PORT,        // Puerto (por defecto MySQL usa 3306)
});

const db = connectionPool.promise();

module.exports = db;


const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perenne_development',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
 
module.exports = pool;
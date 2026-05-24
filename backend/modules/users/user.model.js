// backend/modules/users/user.model.js

const db      = require('../../config/db');
const bcrypt  = require('bcryptjs');

//  A mayor número, más seguro pero más lento. 
const SALT_ROUNDS = 10;

class UserModel {

  //  INSERCIÓN 
  // Registrar un nuevo usuario en la base de datos
  async createUser(userData) {
    const { firstName, lastName, email, phone, password, role } = userData;

    // Encriptación de la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      firstName,
      lastName,
      email,
      phone,
      hashedPassword, // se guarda el hash, nunca la contraseña original
      role
]);
    return result;
  }

  //  CONSULTA TODOS 
  // Devuelve todos los usuarios. excluir la contraseña por seguridad.
  async getAllUsers() {
    const sql = `
      SELECT user_id, first_name, last_name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA UNO 
  // Buscar un usuario por su id.  
  async getUserById(userId) {
    const sql = `
      SELECT user_id, first_name, last_name, email, phone, role, created_at
      FROM users
      WHERE user_id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  }

  //  ACTUALIZACIÓN 
  // Actualiza los datos de un usuario. (la constraseña se actualiza a parte)
  async updateUser(userId, userData) {
    const { firstName, lastName, email, phone, role } = userData;
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [
      firstName,
      lastName,
      email,
      phone,
      role,
      userId
    ]);
    return result;
  }

  //  ACTUALIZACIÓN DE CONTRASEÑA 
  async updateUserPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const sql = `UPDATE users SET password = ? WHERE user_id = ?`;
    const [result] = await db.execute(sql, [hashedPassword, userId]);
    return result;
  }

  //  ELIMINACIÓN 
  // Elimina un usuario por su id
  async deleteUser(userId) {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }
}

module.exports = new UserModel();
// backend/modules/settings/settings.model.js

const db     = require('../../config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class SettingsModel {

  // ════════════════════════════════════════════════════════════
  //  PERFIL
  // ════════════════════════════════════════════════════════════

  //  OBTENER PERFIL COMPLETO 
  async getProfile(userId) {
    const sql = `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        avatar_url,
        bio,
        instagram,
        twitter,
        facebook,
        website,
        is_private,
        is_active,
        created_at
      FROM users
      WHERE user_id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  }

  //  ACTUALIZAR DATOS BÁSICOS 
  async updateBasicInfo(userId, data) {
    const { firstName, lastName, phone } = data;
    const sql = `
      UPDATE users
      SET first_name = ?, last_name = ?, phone = ?
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [firstName, lastName, phone || null, userId]);
    return result;
  }

  //  ACTUALIZAR PERFIL PÚBLICO 
  // Foto, bio y redes sociales
  async updatePublicProfile(userId, data) {
    const { avatarUrl, bio, instagram, twitter, facebook, website } = data;
    const sql = `
      UPDATE users
      SET
        avatar_url  = ?,
        bio         = ?,
        instagram   = ?,
        twitter     = ?,
        facebook    = ?,
        website     = ?
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [
      avatarUrl   || null,
      bio         || null,
      instagram   || null,
      twitter     || null,
      facebook    || null,
      website     || null,
      userId
    ]);
    return result;
  }

  //  ACTUALIZAR PRIVACIDAD 
  // Perfil público o privado
  async updatePrivacy(userId, isPrivate) {
    const sql = `UPDATE users SET is_private = ? WHERE user_id = ?`;
    const [result] = await db.execute(sql, [isPrivate, userId]);
    return result;
  }

  //  ACTUALIZAR CORREO 
  async updateEmail(userId, newEmail) {
    const sql = `UPDATE users SET email = ? WHERE user_id = ?`;
    const [result] = await db.execute(sql, [newEmail, userId]);
    return result;
  }

  //  ACTUALIZAR CONTRASEÑA 
  async updatePassword(userId, currentPassword, newPassword) {
    // Primero obtenemos la contraseña actual encriptada
    const [rows] = await db.execute(
      `SELECT password FROM users WHERE user_id = ?`,
      [userId]
    );

    if (!rows[0]) return { error: 'Usuario no encontrado' };

    // Verificamos que la contraseña actual sea correcta
    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) return { error: 'La contraseña actual es incorrecta' };

    // Encriptamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const sql = `UPDATE users SET password = ? WHERE user_id = ?`;
    await db.execute(sql, [hashedPassword, userId]);

    return { success: true };
  }

  // ════════════════════════════════════════════════════════════
  //  CONFIGURACIONES
  // ════════════════════════════════════════════════════════════

  //  OBTENER CONFIGURACIONES 
  async getSettings(userId) {
    const sql = `
      SELECT * FROM user_settings WHERE user_id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);

    // Si el usuario no tiene configuraciones, las creamos con valores por defecto
    if (!rows[0]) {
      await this.createDefaultSettings(userId);
      const [newRows] = await db.execute(sql, [userId]);
      return newRows[0];
    }

    return rows[0];
  }

  //  CREAR CONFIGURACIONES POR DEFECTO 
  // Se llama automáticamente si el usuario no tiene configuraciones
  async createDefaultSettings(userId) {
    const sql = `
      INSERT INTO user_settings (user_id)
      VALUES (?)
    `;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }

  //  ACTUALIZAR CONFIGURACIONES DE NOTIFICACIONES 
  async updateNotificationSettings(userId, settings) {
    const {
      notifyLikes,
      notifyComments,
      notifyReplies,
      notifyShipments,
      notifyNewContent,
      notifyNewProducts
    } = settings;

    const sql = `
      UPDATE user_settings
      SET
        notify_likes          = ?,
        notify_comments       = ?,
        notify_replies        = ?,
        notify_shipments      = ?,
        notify_new_content    = ?,
        notify_new_products   = ?
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [
      notifyLikes        ?? true,
      notifyComments     ?? true,
      notifyReplies      ?? true,
      notifyShipments    ?? true,
      notifyNewContent   ?? true,
      notifyNewProducts  ?? true,
      userId
    ]);
    return result;
  }

  //  ACTUALIZAR PREFERENCIAS DE INTERFAZ 
  async updateInterfaceSettings(userId, settings) {
    const { language, theme } = settings;

    // Valores permitidos
    const validLanguages = ['es', 'en', 'fr', 'pt'];
    const validThemes    = ['light', 'dark', 'system'];

    if (language && !validLanguages.includes(language)) {
      return { error: 'Idioma no válido' };
    }
    if (theme && !validThemes.includes(theme)) {
      return { error: 'Tema no válido' };
    }

    const sql = `
      UPDATE user_settings
      SET language = ?, theme = ?
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [
      language || 'es',
      theme    || 'system',
      userId
    ]);
    return result;
  }

  // ════════════════════════════════════════════════════════════
  //  CUENTA
  // ════════════════════════════════════════════════════════════

  //  DESACTIVAR CUENTA 
  // La cuenta queda inactiva pero no se elimina
  // El usuario puede reactivarla después
  async deactivateAccount(userId) {
    const sql = `UPDATE users SET is_active = FALSE WHERE user_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }

  //  REACTIVAR CUENTA 
  async reactivateAccount(userId) {
    const sql = `UPDATE users SET is_active = TRUE WHERE user_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }

  //  ELIMINAR CUENTA PERMANENTEMENTE 
  // Elimina el usuario y todas sus configuraciones
  async deleteAccount(userId) {
    // Primero eliminamos las configuraciones
    await db.execute(
      `DELETE FROM user_settings WHERE user_id = ?`,
      [userId]
    );

    //  eliminamos las notificaciones
    await db.execute(
      `DELETE FROM notifications WHERE receiver_id = ? OR sender_id = ?`,
      [userId, userId]
    );

    //  eliminamos el usuario
    const [result] = await db.execute(
      `DELETE FROM users WHERE user_id = ?`,
      [userId]
    );
    return result;
  }
}

module.exports = new SettingsModel();
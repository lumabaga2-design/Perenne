// backend/modules/notifications/notification.model.js

const db = require('../../config/db');

class NotificationModel {

  //  INSERCIÓN 
  // Crea una notificación nueva
  async createNotification(notificationData) {
    const {
      receiverId,
      senderId,
      type,
      message,
      itemId,
      itemType
    } = notificationData;

    const sql = `
      INSERT INTO notifications
        (receiver_id, sender_id, type, message, item_id, item_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      receiverId,
      senderId  || null,
      type,
      message,
      itemId    || null,
      itemType  || null
    ]);
    return result;
  }

  //  CONSULTA TODAS LAS DE UN USUARIO 
  //  todas las notificaciones de un usuario ordenadas por fecha
  async getNotificationsByUser(userId) {
    const sql = `
      SELECT
        n.notification_id,
        n.type,
        n.message,
        n.item_id,
        n.item_type,
        n.is_read,
        n.created_at,
        -- Nombre de quien generó la acción
        u.first_name  AS sender_first_name,
        u.last_name   AS sender_last_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.user_id
      WHERE n.receiver_id = ?
      ORDER BY n.created_at DESC
    `;
    // LEFT JOIN porque sender_id puede ser NULL (notificaciones del sistema)
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  //  CONSULTA SOLO NO LEÍDAS 
  // Para mostrar el contador de notificaciones pendientes
  async getUnreadNotifications(userId) {
    const sql = `
      SELECT
        n.notification_id,
        n.type,
        n.message,
        n.item_id,
        n.item_type,
        n.created_at,
        u.first_name  AS sender_first_name,
        u.last_name   AS sender_last_name
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.user_id
      WHERE n.receiver_id = ? AND n.is_read = FALSE
      ORDER BY n.created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  //  CONTAR NO LEÍDAS 
  // solo el número 
  async countUnreadNotifications(userId) {
    const sql = `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0].unread_count;
  }

  //  MARCAR UNA COMO LEÍDA 
  async markAsRead(notificationId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id = ?
    `;
    const [result] = await db.execute(sql, [notificationId]);
    return result;
  }

  //  MARCAR TODAS COMO LEÍDAS 
  // Cuando el usuario abre el panel de notificaciones
  async markAllAsRead(userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }

  //  ELIMINACIÓN UNA 
  async deleteNotification(notificationId) {
    const sql = `DELETE FROM notifications WHERE notification_id = ?`;
    const [result] = await db.execute(sql, [notificationId]);
    return result;
  }

  //  ELIMINACIÓN TODAS 
  // Limpiar todas las notificaciones de un usuario
  async deleteAllNotifications(userId) {
    const sql = `DELETE FROM notifications WHERE receiver_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }
}

module.exports = new NotificationModel();
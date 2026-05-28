// backend/modules/notifications/notification.controller.js

const notificationModel = require('./notification.model');

class NotificationController {

  //     CONSULTA TODAS 
  async getNotificationsByUser(req, res) {
    try {
      const notifications = await notificationModel.getNotificationsByUser(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
  }

  //     CONSULTA NO LEÍDAS 
  async getUnreadNotifications(req, res) {
    try {
      const notifications = await notificationModel.getUnreadNotifications(req.params.userId);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener notificaciones no leídas', error: error.message });
    }
  }

  //     CONTAR NO LEÍDAS 
  async countUnreadNotifications(req, res) {
    try {
      const count = await notificationModel.countUnreadNotifications(req.params.userId);
      res.status(200).json({ unread_count: count });
    } catch (error) {
      res.status(500).json({ message: 'Error al contar notificaciones', error: error.message });
    }
  }

  //  MARCAR UNA COMO LEÍDA 
  async markAsRead(req, res) {
    try {
      const result = await notificationModel.markAsRead(req.params.notificationId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }
      res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      res.status(500).json({ message: 'Error al marcar la notificación', error: error.message });
    }
  }

  //  MARCAR TODAS COMO LEÍDAS 
  async markAllAsRead(req, res) {
    try {
      await notificationModel.markAllAsRead(req.params.userId);
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      res.status(500).json({ message: 'Error al marcar las notificaciones', error: error.message });
    }
  }

  //  ELIMINAR UNA 
  async deleteNotification(req, res) {
    try {
      const result = await notificationModel.deleteNotification(req.params.notificationId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }
      res.status(200).json({ message: 'Notificación eliminada' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la notificación', error: error.message });
    }
  }

  //  ELIMINAR TODAS ─────────────────────────────────────────
  async deleteAllNotifications(req, res) {
    try {
      await notificationModel.deleteAllNotifications(req.params.userId);
      res.status(200).json({ message: 'Todas las notificaciones eliminadas' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar las notificaciones', error: error.message });
    }
  }
}

module.exports = new NotificationController();
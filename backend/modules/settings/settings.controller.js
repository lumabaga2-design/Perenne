// backend/modules/settings/settings.controller.js

const settingsModel = require('./settings.model');

class SettingsController {

  // ════════════════════════════════════════════════════════════
  //  PERFIL
  // ════════════════════════════════════════════════════════════

  //  OBTENER PERFIL 
  async getProfile(req, res) {
    try {
      const profile = await settingsModel.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
  }

  //  ACTUALIZAR DATOS BÁSICOS 
  async updateBasicInfo(req, res) {
    try {
      const { firstName, lastName } = req.body;

      if (!firstName || !lastName) {
        return res.status(400).json({ message: 'Nombre y apellido son obligatorios' });
      }

      const result = await settingsModel.updateBasicInfo(req.params.userId, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Datos actualizados exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar los datos', error: error.message });
    }
  }

  //  ACTUALIZAR PERFIL PÚBLICO 
  async updatePublicProfile(req, res) {
    try {
      const result = await settingsModel.updatePublicProfile(req.params.userId, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Perfil actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
    }
  }

  //  ACTUALIZAR PRIVACIDAD 
  async updatePrivacy(req, res) {
    try {
      const { isPrivate } = req.body;

      if (isPrivate === undefined) {
        return res.status(400).json({ message: 'El campo isPrivate es obligatorio' });
      }

      const result = await settingsModel.updatePrivacy(req.params.userId, isPrivate);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({
        message: isPrivate ? 'Perfil configurado como privado' : 'Perfil configurado como público'
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la privacidad', error: error.message });
    }
  }

  //  ACTUALIZAR CORREO 
  async updateEmail(req, res) {
    try {
      const { newEmail } = req.body;

      if (!newEmail) {
        return res.status(400).json({ message: 'El nuevo correo es obligatorio' });
      }

      const result = await settingsModel.updateEmail(req.params.userId, newEmail);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Correo actualizado exitosamente' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Este correo ya está en uso' });
      }
      res.status(500).json({ message: 'Error al actualizar el correo', error: error.message });
    }
  }

  //  ACTUALIZAR CONTRASEÑA 
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'La contraseña actual y la nueva son obligatorias' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const result = await settingsModel.updatePassword(
        req.params.userId,
        currentPassword,
        newPassword
      );

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
    }
  }

  // ════════════════════════════════════════════════════════════
  //  CONFIGURACIONES
  // ════════════════════════════════════════════════════════════

  //  OBTENER CONFIGURACIONES 
  async getSettings(req, res) {
    try {
      const settings = await settingsModel.getSettings(req.params.userId);
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las configuraciones', error: error.message });
    }
  }

  //  ACTUALIZAR NOTIFICACIONES 
  async updateNotificationSettings(req, res) {
    try {
      const result = await settingsModel.updateNotificationSettings(
        req.params.userId,
        req.body
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Configuraciones no encontradas' });
      }
      res.status(200).json({ message: 'Configuraciones de notificaciones actualizadas' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar las notificaciones', error: error.message });
    }
  }

  //  ACTUALIZAR INTERFAZ 
  async updateInterfaceSettings(req, res) {
    try {
      const result = await settingsModel.updateInterfaceSettings(
        req.params.userId,
        req.body
      );

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Configuraciones no encontradas' });
      }
      res.status(200).json({ message: 'Preferencias de interfaz actualizadas' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la interfaz', error: error.message });
    }
  }

  // ════════════════════════════════════════════════════════════
  //  CUENTA
  // ════════════════════════════════════════════════════════════

  //  DESACTIVAR CUENTA 
  async deactivateAccount(req, res) {
    try {
      const result = await settingsModel.deactivateAccount(req.params.userId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Cuenta desactivada. Puedes reactivarla cuando quieras' });
    } catch (error) {
      res.status(500).json({ message: 'Error al desactivar la cuenta', error: error.message });
    }
  }

  //  REACTIVAR CUENTA 
  async reactivateAccount(req, res) {
    try {
      const result = await settingsModel.reactivateAccount(req.params.userId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Cuenta reactivada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al reactivar la cuenta', error: error.message });
    }
  }

  //  ELIMINAR CUENTA 
  async deleteAccount(req, res) {
    try {
      const { confirmDelete } = req.body;

      // Pedimos confirmación explícita para evitar eliminaciones accidentales
      if (confirmDelete !== true) {
        return res.status(400).json({
          message: 'Debes confirmar la eliminación enviando confirmDelete: true'
        });
      }

      const result = await settingsModel.deleteAccount(req.params.userId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Cuenta eliminada permanentemente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la cuenta', error: error.message });
    }
  }
}

module.exports = new SettingsController();
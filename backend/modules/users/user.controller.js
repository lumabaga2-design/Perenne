// backend/modules/users/user.controller.js

const userModel = require('./user.model');

class UserController {

  //  INSERCIÓN 
  async createUser(req, res) {
    try {
      // se valida que los campos obligatorios lleguen en la petición
      const { firstName, lastName, email, password, role } = req.body;

      if (!firstName || !lastName || !email || !password) {
        // Si falta alguno, respondemos con error 400 (Bad Request)
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }

      // se valida que el rol sea de los permitidos
      const allowedRoles = ['collaborator', 'user'];
      if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'El rol no es válido' });
      }

      const result = await userModel.createUser(req.body);
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        userId: result.insertId
      });
    } catch (error) {
      // El código 1062 de MySQL significa que el correo ya existe (UNIQUE)
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El correo ya está registrado' });
      }
      res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllUsers(req, res) {
    try {
      const users = await userModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
  }

  //  CONSULTA UNO 
  async getUserById(req, res) {
    try {
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  }

  //  ACTUALIZACIÓN 
  async updateUser(req, res) {
    try {
      const result = await userModel.updateUser(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El correo ya está registrado' });
      }
      res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
  }

  //  ACTUALIZACIÓN DE CONTRASEÑA 
  async updateUserPassword(req, res) {
    try {
      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: 'La nueva contraseña es obligatoria' });
      }
      const result = await userModel.updateUserPassword(req.params.id, newPassword);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deleteUser(req, res) {
    try {
      const result = await userModel.deleteUser(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  }
}

module.exports = new UserController();
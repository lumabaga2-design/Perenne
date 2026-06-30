const UserModel = require('../user.model');
const db = require('../../../config/database');
 
// Mock de la base de datos para no afectar datos reales
jest.mock('../../../config/database');
 
describe('UserModel - Pruebas de Base de Datos', () => {
  
  // PRUEBA 1: Crear usuario correctamente
  describe('create()', () => {
    test('Debe crear un usuario con datos válidos', async () => {
      const datosUsuario = {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@ejemplo.com',
        phone: '3001234567',
        password: 'password123',
        role: 'user'
      };
 
      // Mock del resultado de la BD
      db.execute.mockResolvedValue([{ insertId: 1 }]);
 
      // Ejecutar función
      const resultado = await UserModel.create(datosUsuario);
 
      // Verificar que se llamó a la BD correctamente
      expect(db.execute).toHaveBeenCalled();
      
      // Verificar que retorna el ID
      expect(resultado).toBe(1);
    });
 
    test('Debe fallar con email vacío', async () => {
      const datosInvalidos = {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: '', // Email vacío - INVÁLIDO
        password: 'password123',
        role: 'user'
      };
 
      // Esperar error
      await expect(UserModel.create(datosInvalidos))
        .rejects
        .toThrow('Email es requerido');
    });
  });
 
  // PRUEBA 2: Obtener todos los usuarios
  describe('getAll()', () => {
    test('Debe retornar lista de usuarios', async () => {
      const usuariosSimulados = [
        { user_id: 1, first_name: 'Juan', email: 'juan@ejemplo.com' },
        { user_id: 2, first_name: 'María', email: 'maria@ejemplo.com' }
      ];
 
      db.execute.mockResolvedValue([usuariosSimulados]);
 
      const usuarios = await UserModel.getAll();
 
      expect(usuarios).toHaveLength(2);
      expect(usuarios[0].first_name).toBe('Juan');
    });
 
    test('Debe retornar array vacío si no hay usuarios', async () => {
      db.execute.mockResolvedValue([[]]);
 
      const usuarios = await UserModel.getAll();
 
      expect(usuarios).toEqual([]);
    });
  });
 
  // PRUEBA 3: Obtener usuario por ID
  describe('getById()', () => {
    test('Debe retornar usuario si existe', async () => {
      const usuarioSimulado = { 
        user_id: 1, 
        first_name: 'Juan',
        email: 'juan@ejemplo.com' 
      };
 
      db.execute.mockResolvedValue([usuarioSimulado]);
 
      const usuario = await UserModel.getById(1);
 
      expect(usuario).toBeDefined();
      expect(usuario.first_name).toBe('Juan');
    });
 
    test('Debe retornar undefined si no existe', async () => {
      db.execute.mockResolvedValue([undefined]);
 
      const usuario = await UserModel.getById(999);
 
      expect(usuario).toBeUndefined();
    });
  });
 
  // PRUEBA 4: Actualizar usuario
  describe('update()', () => {
    test('Debe actualizar usuario correctamente', async () => {
      const datosActualizados = {
        first_name: 'Juan',
        last_name: 'García',
        email: 'juan.garcia@ejemplo.com',
        phone: '3009876543',
        role: 'collaborator'
      };
 
      db.execute.mockResolvedValue([{ affectedRows: 1 }]);
 
      const actualizado = await UserModel.update(1, datosActualizados);
 
      expect(actualizado).toBe(true);
    });
 
    test('Debe retornar false si usuario no existe', async () => {
      db.execute.mockResolvedValue([{ affectedRows: 0 }]);
 
      const actualizado = await UserModel.update(999, {});
 
      expect(actualizado).toBe(false);
    });
  });
 
  // PRUEBA 5: Eliminar usuario
  describe('delete()', () => {
    test('Debe eliminar usuario correctamente', async () => {
      db.execute.mockResolvedValue([{ affectedRows: 1 }]);
 
      const eliminado = await UserModel.delete(1);
 
      expect(eliminado).toBe(true);
    });
 
    test('Debe retornar false si usuario no existe', async () => {
      db.execute.mockResolvedValue([{ affectedRows: 0 }]);
 
      const eliminado = await UserModel.delete(999);
 
      expect(eliminado).toBe(false);
    });
  });
});
 
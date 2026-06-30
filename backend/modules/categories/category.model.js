const db = require('../../config/db');
 
class CategoryModel {
  
  /**
   * MÉTODO: create()
   * ¿QUÉ HACE?: Crea una nueva categoría en la BD
   * PARÁMETROS: data (objeto con nombre, descripción, etc)
   * RETORNA: ID de la nueva categoría
   */
  static async create(data) {
    // Validación básica en el model
    if (!data.name || data.name.trim() === '') {
      throw new Error('El nombre es requerido');
    }
 
    // Preparar la consulta SQL
    const query = `
      INSERT INTO categories (name, description, image_url, is_active)
      VALUES (?, ?, ?, ?)
    `;
 
    try {
      // Ejecutar consulta con parámetros (previene SQL injection)
      const [result] = await db.execute(query, [
        data.name.trim(),           // Parámetro 1: nombre
        data.description || null,   // Parámetro 2: descripción
        data.image_url || null,     // Parámetro 3: imagen
        data.is_active !== false    // Parámetro 4: activa (por defecto true)
      ]);
 
      // Retornar el ID de la nueva categoría
      return result.insertId;
    } catch (error) {
      // Si hay error de duplicado (nombre ya existe)
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('La categoría ya existe');
      }
      throw error;
    }
  }
 
  /**
   * MÉTODO: getAll()
   * ¿QUÉ HACE?: Obtiene todas las categorías
   * PARÁMETROS: ninguno
   * RETORNA: Array de categorías
   */
  static async getAll() {
    const query = `
      SELECT * FROM categories 
      ORDER BY created_at DESC
    `;
 
    const [rows] = await db.execute(query);
    return rows;
  }
 
  /**
   * MÉTODO: getById()
   * ¿QUÉ HACE?: Obtiene una categoría específica por ID
   * PARÁMETROS: categoryId (número)
   * RETORNA: Objeto categoría o undefined
   */
  static async getById(categoryId) {
    const query = `
      SELECT * FROM categories 
      WHERE category_id = ?
    `;
 
    const [rows] = await db.execute(query, [categoryId]);
    // Retorna el primer resultado o undefined
    return rows[0];
  }
 
  /**
   * MÉTODO: getByName()
   * ¿QUÉ HACE?: Busca categoría por nombre (búsqueda)
   * PARÁMETROS: name (texto)
   * RETORNA: Array de categorías que coinciden
   */
  static async getByName(name) {
    const query = `
      SELECT * FROM categories 
      WHERE name LIKE ? 
      ORDER BY name ASC
    `;
 
    const searchTerm = `%${name}%`; // %texto% permite búsquedas parciales
    const [rows] = await db.execute(query, [searchTerm]);
    return rows;
  }
 
  /**
   * MÉTODO: update()
   * ¿QUÉ HACE?: Actualiza una categoría existente
   * PARÁMETROS: categoryId (número), data (objeto)
   * RETORNA: true si se actualizó, false si no existe
   */
  static async update(categoryId, data) {
    const query = `
      UPDATE categories 
      SET 
        name = ?,
        description = ?,
        image_url = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE category_id = ?
    `;
 
    const [result] = await db.execute(query, [
      data.name || '',
      data.description || null,
      data.image_url || null,
      data.is_active !== false,
      categoryId
    ]);
 
    // affectedRows > 0 significa que se actualizó
    return result.affectedRows > 0;
  }
 
  /**
   * MÉTODO: delete()
   * ¿QUÉ HACE?: Elimina una categoría
   * PARÁMETROS: categoryId (número)
   * RETORNA: true si se eliminó, false si no existe
   */
  static async delete(categoryId) {
    const query = `
      DELETE FROM categories 
      WHERE category_id = ?
    `;
 
    const [result] = await db.execute(query, [categoryId]);
    return result.affectedRows > 0;
  }
 
  /**
   * MÉTODO: getActive()
   * ¿QUÉ HACE?: Obtiene solo categorías activas
   * PARÁMETROS: ninguno
   * RETORNA: Array de categorías activas
   */
  static async getActive() {
    const query = `
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY name ASC
    `;
 
    const [rows] = await db.execute(query);
    return rows;
  }
 
  /**
   * MÉTODO: count()
   * ¿QUÉ HACE?: Cuenta cuántas categorías hay en total
   * PARÁMETROS: ninguno
   * RETORNA: Número de categorías
   */
  static async count() {
    const query = `SELECT COUNT(*) as total FROM categories`;
    const [rows] = await db.execute(query);
    return rows[0].total;
  }
}
 
module.exports = CategoryModel;
 



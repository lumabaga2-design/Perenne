/**
 * CATEGORY CONTROLLER
 * Maneja la lógica de negocio y respuestas HTTP
 * 
 * El controller es el intermediario entre:
 * - Frontend (solicitud HTTP)
 * - Model (base de datos)
 * - Frontend (respuesta HTTP)
 */
 
const CategoryModel = require('./category.model');
 
class CategoryController {
 
  /**
   * MÉTODO: create()
   * ¿QUÉ HACE?: Crea una nueva categoría
   * 
   * PROCESO:
   * 1. Recibe datos del formulario (req.body)
   * 2. Valida que sean correctos
   * 3. Llama al modelo para guardar
   * 4. Retorna respuesta HTTP
   */
  static async create(req, res) {
    try {
      // Paso 1: Obtener datos del body
      const { name, description, image_url, is_active } = req.body;
 
      // Paso 2: VALIDACIONES - Verificar que los datos sean válidos
      
      // Validación 1: ¿Existe el nombre?
      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          error: true,
          message: 'El nombre es requerido y debe ser texto',
          field: 'name'
        });
      }
 
      // Validación 2: ¿Tiene longitud válida? (entre 3 y 100)
      if (name.trim().length < 3 || name.trim().length > 100) {
        return res.status(400).json({
          error: true,
          message: 'El nombre debe tener entre 3 y 100 caracteres',
          field: 'name'
        });
      }
 
      // Validación 3: ¿Descripción válida? (si existe, máximo 500 caracteres)
      if (description && description.length > 500) {
        return res.status(400).json({
          error: true,
          message: 'La descripción no puede exceder 500 caracteres',
          field: 'description'
        });
      }
 
 
      // Paso 3: Llamar al model para guardar en BD
      const categoryId = await CategoryModel.create({
        name: name.trim(),
        description: description || null,
        image_url: image_url || null,
        is_active: is_active !== false
      });
 
      // Paso 4: Retornar respuesta exitosa (201 = Creado)
      return res.status(201).json({
        error: false,
        message: 'Categoría creada correctamente',
        category_id: categoryId,
        data: {
          category_id: categoryId,
          name: name.trim(),
          description: description || null,
          image_url: image_url || null,
          is_active: is_active !== false
        }
      });
 
    } catch (error) {
      // Manejo de errores
      console.error('Error al crear categoría:', error);
 
      // Si el error es "categoría ya existe"
      if (error.message.includes('ya existe')) {
        return res.status(400).json({
          error: true,
          message: error.message
        });
      }
 
      // Error desconocido
      return res.status(500).json({
        error: true,
        message: 'Error al crear la categoría',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
 
  /**
   * MÉTODO: getAll()
   * ¿QUÉ HACE?: Obtiene todas las categorías
   */
  static async getAll(req, res) {
    try {
      // Opción 1: Obtener todas sin filtros
      const categories = await CategoryModel.getAll();
 
      // Si no hay categorías
      if (categories.length === 0) {
        return res.json({
          error: false,
          message: 'No hay categorías disponibles',
          total: 0,
          data: []
        });
      }
 
      // Retornar con información
      return res.json({
        error: false,
        message: 'Categorías obtenidas correctamente',
        total: categories.length,
        data: categories
      });
 
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener categorías'
      });
    }
  }
 
  /**
   * MÉTODO: getById()
   * ¿QUÉ HACE?: Obtiene una categoría específica
   */
  static async getById(req, res) {
    try {
      // Obtener ID de la URL
      const { categoryId } = req.params;
 
      // Validar que sea número
      if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
          error: true,
          message: 'ID inválido',
          field: 'categoryId'
        });
      }
 
      // Buscar en la BD
      const category = await CategoryModel.getById(categoryId);
 
      // Si no existe
      if (!category) {
        return res.status(404).json({
          error: true,
          message: 'Categoría no encontrada',
          category_id: categoryId
        });
      }
 
      // Retornar categoría encontrada
      return res.json({
        error: false,
        message: 'Categoría obtenida correctamente',
        data: category
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener categoría'
      });
    }
  }
 
  /**
   * MÉTODO: update()
   * ¿QUÉ HACE?: Actualiza una categoría
   */
  static async update(req, res) {
    try {
      const { categoryId } = req.params;
      const { name, description, image_url, is_active } = req.body;
 
      // Validar ID
      if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
          error: true,
          message: 'ID inválido'
        });
      }
 
      // Validar que el nombre, si se proporciona, sea válido
      if (name && (name.trim().length < 3 || name.trim().length > 100)) {
        return res.status(400).json({
          error: true,
          message: 'El nombre debe tener entre 3 y 100 caracteres',
          field: 'name'
        });
      }
 
      // Verificar que existe antes de actualizar
      const existingCategory = await CategoryModel.getById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({
          error: true,
          message: 'Categoría no encontrada'
        });
      }
 
      // Actualizar
      const updated = await CategoryModel.update(categoryId, {
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description,
        image_url: image_url !== undefined ? image_url : existingCategory.image_url,
        is_active: is_active !== undefined ? is_active : existingCategory.is_active
      });
 
      if (!updated) {
        return res.status(500).json({
          error: true,
          message: 'No se pudo actualizar la categoría'
        });
      }
 
      // Obtener y retornar datos actualizados
      const updatedCategory = await CategoryModel.getById(categoryId);
      return res.json({
        error: false,
        message: 'Categoría actualizada correctamente',
        data: updatedCategory
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al actualizar categoría'
      });
    }
  }
 
  /**
   * MÉTODO: delete()
   * ¿QUÉ HACE?: Elimina una categoría
   */
  static async delete(req, res) {
    try {
      const { categoryId } = req.params;
 
      if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
          error: true,
          message: 'ID inválido'
        });
      }
 
      // Verificar que existe
      const category = await CategoryModel.getById(categoryId);
      if (!category) {
        return res.status(404).json({
          error: true,
          message: 'Categoría no encontrada'
        });
      }
 
      // Eliminar
      const deleted = await CategoryModel.delete(categoryId);
 
      if (!deleted) {
        return res.status(500).json({
          error: true,
          message: 'No se pudo eliminar la categoría'
        });
      }
 
      // Retornar 204 o 200
      return res.status(200).json({
        error: false,
        message: 'Categoría eliminada correctamente',
        category_id: categoryId
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al eliminar categoría'
      });
    }
  }
 
  /**
   * MÉTODO: search()
   * ¿QUÉ HACE?: Busca categorías por nombre
   */
  static async search(req, res) {
    try {
      const { query } = req.query; // ?query=camisa
 
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          error: true,
          message: 'La búsqueda debe tener al menos 2 caracteres',
          field: 'query'
        });
      }
 
      const results = await CategoryModel.getByName(query);
 
      return res.json({
        error: false,
        message: 'Búsqueda completada',
        total: results.length,
        query: query,
        data: results
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al buscar categorías'
      });
    }
  }
 
  /**
   * MÉTODO: getActive()
   * ¿QUÉ HACE?: Obtiene solo categorías activas
   */
  static async getActive(req, res) {
    try {
      const categories = await CategoryModel.getActive();
 
      return res.json({
        error: false,
        message: 'Categorías activas obtenidas',
        total: categories.length,
        data: categories
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener categorías activas'
      });
    }
  }
 
  /**
   * MÉTODO AUXILIAR: isValidUrl()
   * ¿QUÉ HACE?: Verifica si una URL es válida
   */
  static isValidUrl(urlString) {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }
}
 
module.exports = CategoryController;
 
 

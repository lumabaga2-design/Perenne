/**
 * CATEGORY ROUTES
 * Define todos los endpoints disponibles para categorías
 * 
 * ESTRUCTURA:
 * Método HTTP | Ruta | Controlador
 */
 
const express = require('express');
const CategoryController = require('./category.controller');
 
const router = express.Router();
 
/**
 * ENDPOINT 1: POST /api/categories
 * ¿QUÉ HACE?: Crea una nueva categoría
 * 
 * CUERPO (JSON):
 * {
 *   "name": "Electrónica",
 *   "description": "Productos electrónicos",
 *   "image_url": "https://...",
 *   "is_active": true
 * }
 * 
 * RESPUESTA: HTTP 201 + ID de la nueva categoría
 */
router.post('/', CategoryController.create);
 
/**
 * ENDPOINT 2: GET /api/categories
 * ¿QUÉ HACE?: Obtiene todas las categorías
 * 
 * PARÁMETROS: Ninguno
 * 
 * RESPUESTA: HTTP 200 + Array de categorías
 */
router.get('/', CategoryController.getAll);
 
/**
 * ENDPOINT 3: GET /api/categories/active
 * ¿QUÉ HACE?: Obtiene solo categorías activas
 * 
 * RESPUESTA: HTTP 200 + Array de categorías activas
 * 
 * NOTA: Este endpoint va ANTES de /:categoryId para que funcione
 */
router.get('/active', CategoryController.getActive);
 
/**
 * ENDPOINT 4: GET /api/categories/search?query=
 * ¿QUÉ HACE?: Busca categorías por nombre
 * 
 * PARÁMETROS: ?query=electrónica
 * 
 * RESPUESTA: HTTP 200 + Resultados de búsqueda
 */
router.get('/search', CategoryController.search);
 
/**
 * ENDPOINT 5: GET /api/categories/:categoryId
 * ¿QUÉ HACE?: Obtiene una categoría específica
 * 
 * PARÁMETRO: categoryId (en la URL)
 * Ejemplo: GET /api/categories/1
 * 
 * RESPUESTA: HTTP 200 + Datos de la categoría
 *            HTTP 404 si no existe
 */
router.get('/:categoryId', CategoryController.getById);
 
/**
 * ENDPOINT 6: PUT /api/categories/:categoryId
 * ¿QUÉ HACE?: Actualiza una categoría
 * 
 * PARÁMETRO: categoryId
 * 
 * CUERPO (JSON) - Todos opcionales:
 * {
 *   "name": "Nuevo nombre",
 *   "description": "Nueva descripción",
 *   "image_url": "https://...",
 *   "is_active": false
 * }
 * 
 * RESPUESTA: HTTP 200 + Datos actualizados
 */
router.put('/:categoryId', CategoryController.update);
 
/**
 * ENDPOINT 7: DELETE /api/categories/:categoryId
 * ¿QUÉ HACE?: Elimina una categoría
 * 
 * PARÁMETRO: categoryId
 * 
 * RESPUESTA: HTTP 200 + Mensaje de confirmación
 *            HTTP 404 si no existe
 */
router.delete('/:categoryId', CategoryController.delete);
 
module.exports = router;

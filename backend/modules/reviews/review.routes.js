
const express = require('express');
const ReviewController = require('./review.controller');
const { verifyToken, verifyRole } = require('../../middleware/auth');
 
const router = express.Router();
 
/**
 * ENDPOINT 1: POST /api/reviews
 * CREAR reseña (requiere autenticación)
 */
router.post('/', verifyToken, ReviewController.create);
 
/**
 * ENDPOINT 2: GET /api/reviews
 * OBTENER todas con filtros y paginación
 */
router.get('/', ReviewController.getAll);
 
/**
 * ENDPOINT 3: GET /api/reviews/product/:productId
 * OBTENER reseñas de un producto
 */
router.get('/product/:productId', ReviewController.getByProduct);
 
/**
 * ENDPOINT 4: GET /api/reviews/user/:userId
 * OBTENER reseñas de un usuario
 */
router.get('/user/:userId', ReviewController.getByUser);
 
/**
 * ENDPOINT 5: GET /api/reviews/stats/product/:productId
 * OBTENER estadísticas de un producto
 * (DEBE ANTES DE /:reviewId)
 */
router.get('/stats/product/:productId', ReviewController.getProductStats);
 
/**
 * ENDPOINT 6: GET /api/reviews/:reviewId
 * OBTENER una reseña específica
 */
router.get('/:reviewId', ReviewController.getById);
 
/**
 * ENDPOINT 7: PUT /api/reviews/:reviewId
 * ACTUALIZAR reseña (requiere autenticación)
 */
router.put('/:reviewId', verifyToken, ReviewController.update);
 
/**
 * ENDPOINT 8: PATCH /api/reviews/:reviewId/status
 * CAMBIAR estado (solo admin)
 */
router.patch('/:reviewId/status', verifyToken, verifyRole('admin'), ReviewController.updateStatus);
 
/**
 * ENDPOINT 9: POST /api/reviews/:reviewId/helpful
 * MARCAR como útil (requiere autenticación)
 */
router.post('/:reviewId/helpful', verifyToken, ReviewController.markHelpful);
 
/**
 * ENDPOINT 10: DELETE /api/reviews/:reviewId
 * ELIMINAR reseña (requiere autenticación)
 */
router.delete('/:reviewId', verifyToken, ReviewController.delete);
 
module.exports = router;
 

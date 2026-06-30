const ReviewModel = require('./review.model');
 
/**
 * VALIDACIONES REUTILIZABLES
 */
class ReviewValidations {
 
  static validateRating(rating) {
    const ratingNum = parseInt(rating);
 
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error('La calificación debe ser un número entre 1 y 5');
    }
 
    return ratingNum;
  }
 
  static validateTitle(title) {
    if (!title) return null;
 
    if (typeof title !== 'string') {
      throw new Error('El título debe ser texto');
    }
 
    const trimmed = title.trim();
 
    if (trimmed.length > 100) {
      throw new Error('El título no puede exceder 100 caracteres');
    }
 
    return trimmed;
  }
 
  static validateComment(comment) {
    if (!comment) return null;
 
    if (typeof comment !== 'string') {
      throw new Error('El comentario debe ser texto');
    }
 
    const trimmed = comment.trim();
 
    // Mínimo 10 caracteres para un comentario
    if (trimmed.length > 0 && trimmed.length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres');
    }
 
    // Máximo 2000 caracteres
    if (trimmed.length > 2000) {
      throw new Error('El comentario no puede exceder 2000 caracteres');
    }
 
    return trimmed;
  }
}
 
/**
 * CONTROLLER PRINCIPAL
 */
class ReviewController {
 
  /**
   * CREATE - Crear nueva reseña
   * 
   * VALIDACIONES:
   * ✅ Usuario autenticado
   * ✅ Calificación entre 1-5
   * ✅ Título máx 100 caracteres
   * ✅ Comentario 10-2000 caracteres
   * ✅ Producto existe
   * ✅ Usuario no ha reseñado este producto
   */
  static async create(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Debes estar autenticado para crear reseñas'
        });
      }
 
      const { product_id, rating, title, comment } = req.body;
 
      // Validar producto_id
      if (!product_id || isNaN(product_id)) {
        return res.status(400).json({
          error: true,
          message: 'ID de producto inválido'
        });
      }
 
      // VALIDACIONES
      try {
        var validatedRating = ReviewValidations.validateRating(rating);
        var validatedTitle = ReviewValidations.validateTitle(title);
        var validatedComment = ReviewValidations.validateComment(comment);
      } catch (validationError) {
        return res.status(400).json({
          error: true,
          message: validationError.message
        });
      }
 
      // Verificar si usuario ya reseñó este producto
      const existingReview = await ReviewModel.userHasReview(req.user.user_id, product_id);
      if (existingReview) {
        return res.status(400).json({
          error: true,
          message: 'Ya has reseñado este producto',
          existing_review_id: existingReview
        });
      }
 
      // Verificar si es compra verificada
      const isVerified = await ReviewModel.isVerifiedPurchase(req.user.user_id, product_id);
 
      // Crear reseña
      const reviewId = await ReviewModel.create({
        product_id,
        user_id: req.user.user_id,
        rating: validatedRating,
        title: validatedTitle,
        comment: validatedComment,
        is_verified_purchase: isVerified
      });
 
      const newReview = await ReviewModel.getById(reviewId);
 
      return res.status(201).json({
        error: false,
        message: 'Reseña creada correctamente (pendiente de aprobación)',
        data: newReview
      });
 
    } catch (error) {
      console.error('Error al crear reseña:', error);
 
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({
          error: true,
          message: error.message
        });
      }
 
      return res.status(500).json({
        error: true,
        message: 'Error al crear la reseña',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
 
  /**
   * READ - Obtener todas las reseñas
   */
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const productId = req.query.product_id;
      const userId = req.query.user_id;
      const rating = req.query.rating;
      const status = req.query.status || 'approved';
      const verifiedOnly = req.query.verified_only === 'true';
 
      // Validar paginación
      if (page < 1 || limit < 1) {
        return res.status(400).json({
          error: true,
          message: 'Parámetros de paginación inválidos'
        });
      }
 
      const result = await ReviewModel.getAll(page, limit, {
        product_id: productId ? parseInt(productId) : null,
        user_id: userId ? parseInt(userId) : null,
        rating: rating ? parseInt(rating) : null,
        status: status,
        verified_only: verifiedOnly
      });
 
      return res.json({
        error: false,
        message: 'Reseñas obtenidas correctamente',
        ...result
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener reseñas'
      });
    }
  }
 
  /**
   * READ - Obtener reseñas de un producto
   */
  static async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
 
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de producto inválido'
        });
      }
 
      const result = await ReviewModel.getByProduct(productId, page, limit);
 
      return res.json({
        error: false,
        message: 'Reseñas de producto obtenidas',
        product_id: productId,
        ...result
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener reseñas'
      });
    }
  }
 
  /**
   * READ - Obtener reseñas de un usuario
   */
  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
 
      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de usuario inválido'
        });
      }
 
      const reviews = await ReviewModel.getByUser(userId);
 
      return res.json({
        error: false,
        message: 'Reseñas del usuario obtenidas',
        total: reviews.length,
        data: reviews
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener reseñas'
      });
    }
  }
 
  /**
   * READ - Obtener una reseña específica
   */
  static async getById(req, res) {
    try {
      const { reviewId } = req.params;
 
      if (!reviewId || isNaN(reviewId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de reseña inválido'
        });
      }
 
      const review = await ReviewModel.getById(reviewId);
 
      if (!review) {
        return res.status(404).json({
          error: true,
          message: 'Reseña no encontrada'
        });
      }
 
      return res.json({
        error: false,
        message: 'Reseña obtenida correctamente',
        data: review
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener reseña'
      });
    }
  }
 
  /**
   * READ - Obtener estadísticas de un producto
   */
  static async getProductStats(req, res) {
    try {
      const { productId } = req.params;
 
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de producto inválido'
        });
      }
 
      const stats = await ReviewModel.getProductStats(productId);
 
      return res.json({
        error: false,
        message: 'Estadísticas obtenidas',
        product_id: productId,
        data: stats
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al obtener estadísticas'
      });
    }
  }
 
  /**
   * UPDATE - Actualizar reseña
   */
  static async update(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Debes estar autenticado'
        });
      }
 
      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;
 
      if (!reviewId || isNaN(reviewId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de reseña inválido'
        });
      }
 
      // Obtener reseña actual
      const currentReview = await ReviewModel.getById(reviewId);
      if (!currentReview) {
        return res.status(404).json({
          error: true,
          message: 'Reseña no encontrada'
        });
      }
 
      // Verificar permisos
      if (currentReview.user_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'No tienes permiso para editar esta reseña'
        });
      }
 
      // VALIDACIONES
      try {
        var validatedRating = ReviewValidations.validateRating(rating);
        var validatedTitle = ReviewValidations.validateTitle(title);
        var validatedComment = ReviewValidations.validateComment(comment);
      } catch (validationError) {
        return res.status(400).json({
          error: true,
          message: validationError.message
        });
      }
 
      // Actualizar
      const updated = await ReviewModel.update(reviewId, {
        rating: validatedRating,
        title: validatedTitle,
        comment: validatedComment
      });
 
      if (!updated) {
        return res.status(500).json({
          error: true,
          message: 'No se pudo actualizar la reseña'
        });
      }
 
      const updatedReview = await ReviewModel.getById(reviewId);
 
      return res.json({
        error: false,
        message: 'Reseña actualizada correctamente',
        data: updatedReview
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al actualizar reseña'
      });
    }
  }
 
  /**
   * UPDATE - Cambiar estado (admin solo)
   */
  static async updateStatus(req, res) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'Solo administradores pueden cambiar el estado'
        });
      }
 
      const { reviewId } = req.params;
      const { status } = req.body;
 
      if (!reviewId || isNaN(reviewId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de reseña inválido'
        });
      }
 
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          error: true,
          message: 'Estado inválido'
        });
      }
 
      const updated = await ReviewModel.updateStatus(reviewId, status);
 
      if (!updated) {
        return res.status(500).json({
          error: true,
          message: 'No se pudo actualizar la reseña'
        });
      }
 
      return res.json({
        error: false,
        message: 'Estado de reseña actualizado',
        review_id: reviewId,
        status: status
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al actualizar estado'
      });
    }
  }
 
  /**
   * UPDATE - Marcar como útil/no útil
   */
  static async markHelpful(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Debes estar autenticado'
        });
      }
 
      const { reviewId } = req.params;
      const { is_helpful } = req.body;
 
      if (!reviewId || isNaN(reviewId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de reseña inválido'
        });
      }
 
      if (typeof is_helpful !== 'boolean') {
        return res.status(400).json({
          error: true,
          message: 'is_helpful debe ser true o false'
        });
      }
 
      // Verificar que la reseña existe
      const review = await ReviewModel.getById(reviewId);
      if (!review) {
        return res.status(404).json({
          error: true,
          message: 'Reseña no encontrada'
        });
      }
 
      // Marcar como útil
      await ReviewModel.markHelpful(reviewId, req.user.user_id, is_helpful);
 
      // Obtener reseña actualizada
      const updatedReview = await ReviewModel.getById(reviewId);
 
      return res.json({
        error: false,
        message: `Reseña marcada como ${is_helpful ? 'útil' : 'no útil'}`,
        data: updatedReview
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al marcar reseña'
      });
    }
  }
 
  /**
   * DELETE - Eliminar reseña
   */
  static async delete(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Debes estar autenticado'
        });
      }
 
      const { reviewId } = req.params;
 
      if (!reviewId || isNaN(reviewId)) {
        return res.status(400).json({
          error: true,
          message: 'ID de reseña inválido'
        });
      }
 
      const review = await ReviewModel.getById(reviewId);
      if (!review) {
        return res.status(404).json({
          error: true,
          message: 'Reseña no encontrada'
        });
      }
 
      // Verificar permisos
      if (review.user_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'No tienes permiso para eliminar esta reseña'
        });
      }
 
      const deleted = await ReviewModel.delete(reviewId);
 
      if (!deleted) {
        return res.status(500).json({
          error: true,
          message: 'No se pudo eliminar la reseña'
        });
      }
 
      return res.json({
        error: false,
        message: 'Reseña eliminada correctamente',
        review_id: reviewId
      });
 
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({
        error: true,
        message: 'Error al eliminar reseña'
      });
    }
  }
}
 
module.exports = ReviewController;
 
 

const db = require('../../config/db');
 
class ReviewModel {
 
  /**
   * CREATE - Crear nueva reseña
   */
  static async create(data) {
    const query = `
      INSERT INTO reviews 
      (product_id, user_id, rating, title, comment, is_verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
 
    try {
      const [result] = await db.execute(query, [
        data.product_id,
        data.user_id,
        data.rating,
        data.title || null,
        data.comment || null,
        data.is_verified_purchase || false,
        'pending' // Requiere aprobación
      ]);
 
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya existe una reseña de este usuario para este producto');
      }
      throw error;
    }
  }
 
  /**
   * READ - Obtener todas las reseñas con paginación
   */
  static async getAll(page = 1, limit = 10, filter = {}) {
    const offset = (page - 1) * limit;
 
    let query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.avatar_url,
        p.name as product_name,
        ROUND(AVG(r.rating) OVER (PARTITION BY r.product_id), 2) as product_avg_rating
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN products p ON r.product_id = p.product_id
      WHERE 1=1
    `;
 
    const params = [];
 
    // Filtros
    if (filter.product_id) {
      query += ' AND r.product_id = ?';
      params.push(filter.product_id);
    }
 
    if (filter.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filter.user_id);
    }
 
    if (filter.rating) {
      query += ' AND r.rating = ?';
      params.push(filter.rating);
    }
 
    if (filter.status) {
      query += ' AND r.status = ?';
      params.push(filter.status);
    }
 
    if (filter.verified_only === true) {
      query += ' AND r.is_verified_purchase = true';
    }
 
    // Ordenamiento y paginación
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
 
    const [rows] = await db.execute(query, params);
 
    // Obtener total
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE 1=1';
    const countParams = [];
 
    if (filter.product_id) {
      countQuery += ' AND product_id = ?';
      countParams.push(filter.product_id);
    }
    if (filter.user_id) {
      countQuery += ' AND user_id = ?';
      countParams.push(filter.user_id);
    }
 
    const [countResult] = await db.execute(countQuery, countParams);
 
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
 
  /**
   * READ - Obtener reseñas de un producto
   */
  static async getByProduct(productId, page = 1, limit = 10, onlyApproved = true) {
    const offset = (page - 1) * limit;
 
    let query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
    `;
 
    const params = [productId];
 
    if (onlyApproved) {
      query += ' AND r.status = "approved"';
    }
 
    query += ' ORDER BY r.helpful_count DESC, r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
 
    const [rows] = await db.execute(query, params);
 
    // Total
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?';
    const countParams = [productId];
 
    if (onlyApproved) {
      countQuery += ' AND status = "approved"';
    }
 
    const [countResult] = await db.execute(countQuery, countParams);
 
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    };
  }
 
  /**
   * READ - Obtener reseñas de un usuario
   */
  static async getByUser(userId) {
    const query = `
      SELECT 
        r.*,
        p.name as product_name,
        p.image_url as product_image
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
 
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
 
  /**
   * READ - Obtener una reseña específica
   */
  static async getById(reviewId) {
    const query = `
      SELECT 
        r.*,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        p.name as product_name,
        p.image_url as product_image
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN products p ON r.product_id = p.product_id
      WHERE r.review_id = ?
    `;
 
    const [rows] = await db.execute(query, [reviewId]);
    return rows[0];
  }
 
  /**
   * READ - Obtener estadísticas de reseñas de un producto
   */
  static async getProductStats(productId) {
    const query = `
      SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as count_5_stars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as count_4_stars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as count_3_stars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as count_2_stars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as count_1_stars,
        SUM(CASE WHEN is_verified_purchase = true THEN 1 ELSE 0 END) as verified_reviews
      FROM reviews
      WHERE product_id = ? AND status = 'approved'
    `;
 
    const [rows] = await db.execute(query, [productId]);
    
    // Calcular porcentajes
    const stats = rows[0];
    if (stats.total_reviews > 0) {
      stats.percentage_5_stars = Math.round((stats.count_5_stars / stats.total_reviews) * 100);
      stats.percentage_4_stars = Math.round((stats.count_4_stars / stats.total_reviews) * 100);
      stats.percentage_3_stars = Math.round((stats.count_3_stars / stats.total_reviews) * 100);
      stats.percentage_2_stars = Math.round((stats.count_2_stars / stats.total_reviews) * 100);
      stats.percentage_1_stars = Math.round((stats.count_1_stars / stats.total_reviews) * 100);
    }
 
    return stats;
  }
 
  /**
   * UPDATE - Actualizar reseña
   */
  static async update(reviewId, data) {
    const query = `
      UPDATE reviews 
      SET 
        rating = ?,
        title = ?,
        comment = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE review_id = ?
    `;
 
    const [result] = await db.execute(query, [
      data.rating,
      data.title || null,
      data.comment || null,
      reviewId
    ]);
 
    return result.affectedRows > 0;
  }
 
  /**
   * UPDATE - Cambiar estado de reseña (aprob ar/rechazar)
   */
  static async updateStatus(reviewId, status) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Estado inválido');
    }
 
    const query = `
      UPDATE reviews 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE review_id = ?
    `;
 
    const [result] = await db.execute(query, [status, reviewId]);
    return result.affectedRows > 0;
  }
 
  /**
   * UPDATE - Marcar como útil
   */
  static async markHelpful(reviewId, userId, isHelpful) {
    // Verificar si ya existe voto
    const checkQuery = `
      SELECT * FROM review_helpfulness 
      WHERE review_id = ? AND user_id = ?
    `;
 
    const [existingVote] = await db.execute(checkQuery, [reviewId, userId]);
 
    if (existingVote.length > 0) {
      // Actualizar voto existente
      const updateQuery = `
        UPDATE review_helpfulness 
        SET is_helpful = ?
        WHERE review_id = ? AND user_id = ?
      `;
      await db.execute(updateQuery, [isHelpful, reviewId, userId]);
    } else {
      // Crear nuevo voto
      const insertQuery = `
        INSERT INTO review_helpfulness (review_id, user_id, is_helpful)
        VALUES (?, ?, ?)
      `;
      await db.execute(insertQuery, [reviewId, userId, isHelpful]);
    }
 
    // Actualizar contadores en reviews
    const updateCountersQuery = `
      UPDATE reviews r
      SET 
        helpful_count = (SELECT COUNT(*) FROM review_helpfulness WHERE review_id = ? AND is_helpful = true),
        unhelpful_count = (SELECT COUNT(*) FROM review_helpfulness WHERE review_id = ? AND is_helpful = false)
      WHERE review_id = ?
    `;
 
    await db.execute(updateCountersQuery, [reviewId, reviewId, reviewId]);
 
    return true;
  }
 
  /**
   * DELETE - Eliminar reseña
   */
  static async delete(reviewId) {
    const query = 'DELETE FROM reviews WHERE review_id = ?';
    const [result] = await db.execute(query, [reviewId]);
    return result.affectedRows > 0;
  }
 
  /**
   * UTILITY - Verificar si usuario ya reseñó este producto
   */
  static async userHasReview(userId, productId) {
    const query = `
      SELECT review_id FROM reviews 
      WHERE user_id = ? AND product_id = ?
      LIMIT 1
    `;
 
    const [rows] = await db.execute(query, [userId, productId]);
    return rows.length > 0 ? rows[0].review_id : null;
  }
 
  /**
   * UTILITY - Verificar compra verificada
   */
  static async isVerifiedPurchase(userId, productId) {
    // Esta es una simplificación - en producción verificarías órdenes completadas
    const query = `
      SELECT COUNT(*) as count FROM orders
      WHERE user_id = ? AND product_id = ? AND status = 'delivered'
      LIMIT 1
    `;
 
    try {
      const [rows] = await db.execute(query, [userId, productId]);
      return rows[0].count > 0;
    } catch (e) {
      // Si la tabla no existe, simplemente no es verificada
      return false;
    }
  }
}
 
module.exports = ReviewModel;
 
 

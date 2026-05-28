// backend/modules/interactions/interaction.model.js

const db = require('../../config/db');

// Tipos válidos de items
const VALID_ITEM_TYPES = ['product', 'content'];

class InteractionModel {

  // ════════════════════════════════════════════════════════════
  //  ME GUSTA
  // ════════════════════════════════════════════════════════════

  //  DAR ME GUSTA 
  async addLike(userId, itemId, itemType) {
    const sql = `
      INSERT INTO likes (user_id, item_id, item_type)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [userId, itemId, itemType]);
    return result;
  }

  //  QUITAR ME GUSTA 
  async removeLike(userId, itemId, itemType) {
    const sql = `
      DELETE FROM likes
      WHERE user_id = ? AND item_id = ? AND item_type = ?
    `;
    const [result] = await db.execute(sql, [userId, itemId, itemType]);
    return result;
  }

  //  CONTAR ME GUSTAS DE UN ITEM 
  async getLikeCount(itemId, itemType) {
    const sql = `
      SELECT COUNT(*) AS total_likes
      FROM likes
      WHERE item_id = ? AND item_type = ?
    `;
    const [rows] = await db.execute(sql, [itemId, itemType]);
    return rows[0].total_likes;
  }

  //  VERIFICAR SI EL USUARIO YA DIO ME GUSTA 
  async userAlreadyLiked(userId, itemId, itemType) {
    const sql = `
      SELECT like_id FROM likes
      WHERE user_id = ? AND item_id = ? AND item_type = ?
    `;
    const [rows] = await db.execute(sql, [userId, itemId, itemType]);
    // Si encontró un registro, el usuario ya dio like
    return rows.length > 0;
  }

  // ════════════════════════════════════════════════════════════
  //  COMENTARIOS
  // ════════════════════════════════════════════════════════════

  //  CREAR COMENTARIO 
  async createComment(commentData) {
    const { userId, itemId, itemType, body, parentId } = commentData;
    const sql = `
      INSERT INTO comments (user_id, item_id, item_type, body, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      userId,
      itemId,
      itemType,
      body,
      parentId || null  // null si es comentario principal
    ]);
    return result;
  }

  //  OBTENER COMENTARIOS DE UN ITEM 
  // Trae comentarios principales con sus respuestas anidadas
  async getCommentsByItem(itemId, itemType) {
    // Primero traemos los comentarios principales 
    const mainSql = `
      SELECT
        c.comment_id,
        c.body,
        c.created_at,
        c.parent_id,
        u.first_name  AS user_first_name,
        u.last_name   AS user_last_name
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.item_id = ? AND c.item_type = ? AND c.parent_id IS NULL
      ORDER BY c.created_at ASC
    `;
    const [mainComments] = await db.execute(mainSql, [itemId, itemType]);

    // Para cada comentario principal, buscar sus respuestas
    for (const comment of mainComments) {
      const replySql = `
        SELECT
          c.comment_id,
          c.body,
          c.created_at,
          c.parent_id,
          u.first_name  AS user_first_name,
          u.last_name   AS user_last_name
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
      `;
      const [replies] = await db.execute(replySql, [comment.comment_id]);

      // Agregamos las respuestas dentro del comentario principal
      comment.replies = replies;
    }

    return mainComments;
  }

  //  ACTUALIZAR COMENTARIO 
  async updateComment(commentId, body) {
    const sql = `UPDATE comments SET body = ? WHERE comment_id = ?`;
    const [result] = await db.execute(sql, [body, commentId]);
    return result;
  }

  //  ELIMINAR COMENTARIO 
  // Al eliminar un comentario, también se eliminan sus respuestas
  async deleteComment(commentId) {
    //  eliminamos las respuestas
    await db.execute(`DELETE FROM comments WHERE parent_id = ?`, [commentId]);
    // eliminar
    //  el comentario principal
    const [result] = await db.execute(`DELETE FROM comments WHERE comment_id = ?`, [commentId]);
    return result;
  }

  // ════════════════════════════════════════════════════════════
  //  COMPARTIR
  // ════════════════════════════════════════════════════════════

  //  GENERAR CÓDIGO ÚNICO DE COMPARTIDO 
  generateShareCode() {
    // Genera un código
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `SHR-${random}`;
  }

  //  CREAR COMPARTIDO 
  async createShare(userId, itemId, itemType) {
    const shareCode = this.generateShareCode();
    const sql = `
      INSERT INTO shares (user_id, item_id, item_type, share_code)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [userId, itemId, itemType, shareCode]);
    return { insertId: result.insertId, shareCode };
  }

  //  RESOLVER LINK COMPARTIDO 
  // Cuando alguien abre un link compartido, buscar el item al que apunta
  async resolveShareCode(shareCode) {
    const sql = `
      SELECT item_id, item_type, created_at
      FROM shares
      WHERE share_code = ?
    `;
    const [rows] = await db.execute(sql, [shareCode]);
    return rows[0];
  }

  //  CONTAR COMPARTIDOS DE UN ITEM 
  async getShareCount(itemId, itemType) {
    const sql = `
      SELECT COUNT(*) AS total_shares
      FROM shares
      WHERE item_id = ? AND item_type = ?
    `;
    const [rows] = await db.execute(sql, [itemId, itemType]);
    return rows[0].total_shares;
  }
}

module.exports = new InteractionModel();
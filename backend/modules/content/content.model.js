// backend/modules/content/content.model.js

const db = require('../../config/db');

class ContentModel {

  //  INSERCIÓN 
  // Solo colaboradores pueden crear contenido 
  async createContent(contentData) {
    const { userId, title, description, contentType, fileUrl, externalUrl } = contentData;

    const sql = `
      INSERT INTO content (user_id, title, description, content_type, file_url, external_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      userId,
      title,
      description,
      contentType,
      fileUrl     || null,  // Si no se envía, guardamos null
      externalUrl || null
    ]);
    return result;
  }

  //  CONSULTA TODOS 
  // Para el feed general 
  async getAllContent() {
    const sql = `
      SELECT
        c.content_id,
        c.title,
        c.description,
        c.content_type,
        c.file_url,
        c.external_url,
        c.created_at,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name
      FROM content c
      -- JOIN une dos tablas para traer el nombre del autor
      JOIN users u ON c.user_id = u.user_id
      WHERE c.is_published = TRUE
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA POR TIPO 
  // Para cada sección
  async getContentByType(contentType) {
    const sql = `
      SELECT
        c.content_id,
        c.title,
        c.description,
        c.content_type,
        c.file_url,
        c.external_url,
        c.created_at,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name
      FROM content c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.is_published = TRUE AND c.content_type = ?
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.execute(sql, [contentType]);
    return rows;
  }

  //  CONSULTA UNO 
  async getContentById(contentId) {
    const sql = `
      SELECT
        c.*,
        u.first_name AS author_first_name,
        u.last_name  AS author_last_name
      FROM content c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.content_id = ?
    `;
    const [rows] = await db.execute(sql, [contentId]);
    return rows[0];
  }

  //  ACTUALIZACIÓN 
  async updateContent(contentId, contentData) {
    const { title, description, fileUrl, externalUrl, isPublished } = contentData;
    const sql = `
      UPDATE content
      SET title = ?, description = ?, file_url = ?, external_url = ?, is_published = ?
      WHERE content_id = ?
    `;
    const [result] = await db.execute(sql, [
      title,
      description,
      fileUrl      || null,
      externalUrl  || null,
      isPublished,
      contentId
    ]);
    return result;
  }

  //  ELIMINACIÓN 
  async deleteContent(contentId) {
    const sql = `DELETE FROM content WHERE content_id = ?`;
    const [result] = await db.execute(sql, [contentId]);
    return result;
  }
}

module.exports = new ContentModel();
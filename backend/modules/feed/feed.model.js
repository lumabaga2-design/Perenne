// backend/modules/feed/feed.model.js

const db = require('../../config/db');

class FeedModel {

  //  CONSULTA FEED GENERAL 
  // mezcla contenido y productos ordenados por fecha
  async getFeed() {
    const sql = `
      SELECT
        'content'          AS feed_type,
        content_id         AS item_id,
        title,
        description,
        content_type       AS extra_info,
        file_url           AS media_url,
        created_at
      FROM content
      WHERE is_published = TRUE

      UNION ALL

      SELECT
        'product'          AS feed_type,
        product_id         AS item_id,
        name               AS title,
        description,
        price              AS extra_info,
        image_url          AS media_url,
        created_at
      FROM products
      WHERE is_available = TRUE

      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA EXPLORAR 
  // Trae contenido reciente para la sección "Explorar"
  async getExploreContent() {
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
      WHERE c.is_published = TRUE
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    // limit no sobrecargar el diseño de la pagina
    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = new FeedModel();
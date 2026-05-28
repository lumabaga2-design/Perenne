// backend/modules/search/search.model.js

const db = require('../../config/db');

class SearchModel {

  // ─── BÚSQUEDA GLOBAL ────────────────────────────────────────
 
  async globalSearch(query) {
    const searchTerm = `%${query}%`;

    //  Búsqueda en usuarios 
    const usersSql = `
      SELECT
        user_id       AS item_id,
        'user'        AS result_type,
        first_name    AS title,
        last_name     AS subtitle,
        email         AS extra_info,
        role          AS category,
        NULL          AS price,
        NULL          AS media_url,
        created_at
      FROM users
      WHERE
        first_name  LIKE ? OR
        last_name   LIKE ? OR
        email       LIKE ?
    `;

    //  Búsqueda en productos 
    const productsSql = `
      SELECT
        p.product_id          AS item_id,
        'product'             AS result_type,
        p.name                AS title,
        p.description         AS subtitle,
        p.price               AS extra_info,
        'product'             AS category,
        p.price               AS price,
        p.image_url           AS media_url,
        p.created_at
      FROM products p
      WHERE
        p.name        LIKE ? OR
        p.description LIKE ?
      AND p.is_available = TRUE
    `;

    //  Búsqueda en contenido 
    const contentSql = `
      SELECT
        c.content_id      AS item_id,
        'content'         AS result_type,
        c.title           AS title,
        c.description     AS subtitle,
        c.content_type    AS extra_info,
        c.content_type    AS category,
        NULL              AS price,
        c.file_url        AS media_url,
        c.created_at
      FROM content c
      WHERE
        c.title         LIKE ? OR
        c.description   LIKE ?
      AND c.is_published = TRUE
    `;

    // ejecucucion las tres búsquedas en paralelo
    // Promise.all espera a que todas terminen antes de continuar
    const [users, products, contents] = await Promise.all([
      db.execute(usersSql,    [searchTerm, searchTerm, searchTerm]),
      db.execute(productsSql, [searchTerm, searchTerm]),
      db.execute(contentSql,  [searchTerm, searchTerm])
    ]);

    return {
      users:    users[0],
      products: products[0],
      content:  contents[0],
      // Total de resultados encontrados
      total: users[0].length + products[0].length + contents[0].length
    };
  }

  //  BÚSQUEDA SOLO USUARIOS 
  async searchUsers(query) {
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT
        user_id,
        first_name,
        last_name,
        email,
        role,
        created_at
      FROM users
      WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
      ORDER BY first_name ASC
    `;
    const [rows] = await db.execute(sql, [searchTerm, searchTerm, searchTerm]);
    return rows;
  }

  //  BÚSQUEDA SOLO PRODUCTOS 
  //  filtrar por nombre, descripción y rango de precio
  async searchProducts(filters) {
    const {
      query,
      minPrice,
      maxPrice,
      sortBy,    // Campo por el que ordenar
      sortOrder  // asc o desc
    } = filters;

    const searchTerm = `%${query}%`;

    // segun filtro
    let sql = `
      SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        u.first_name  AS seller_first_name,
        u.last_name   AS seller_last_name
      FROM products p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.is_available = TRUE
      AND (p.name LIKE ? OR p.description LIKE ?)
    `;

    // Array de valores que irán en los "?"
    const params = [searchTerm, searchTerm];

    // Si se envía precio mínimo,  filtro
    if (minPrice !== undefined && minPrice !== '') {
      sql += ` AND p.price >= ?`;
      params.push(minPrice);
    }

    // Si se envía precio máximo, filtro
    if (maxPrice !== undefined && maxPrice !== '') {
      sql += ` AND p.price <= ?`;
      params.push(maxPrice);
    }

    // Ordenamiento más reciente primero
    const validSortFields  = ['name', 'price', 'created_at'];
    const validSortOrders  = ['ASC', 'DESC'];
    const finalSortBy      = validSortFields.includes(sortBy)   ? sortBy    : 'created_at';
    const finalSortOrder   = validSortOrders.includes(sortOrder) ? sortOrder : 'DESC';

    sql += ` ORDER BY p.${finalSortBy} ${finalSortOrder}`;

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  //  BÚSQUEDA SOLO CONTENIDO 
  // Permite filtrar por título, descripción y tipo de contenido
  async searchContent(filters) {
    const { query, contentType } = filters;
    const searchTerm = `%${query}%`;

    let sql = `
      SELECT
        c.content_id,
        c.title,
        c.description,
        c.content_type,
        c.file_url,
        c.external_url,
        c.created_at,
        u.first_name  AS author_first_name,
        u.last_name   AS author_last_name
      FROM content c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.is_published = TRUE
      AND (c.title LIKE ? OR c.description LIKE ?)
    `;

    const params = [searchTerm, searchTerm];

    // Si se envía un tipo específico (video, pdf, etc.) se filtra por el
    const validTypes = ['video', 'image', 'pdf', 'text', 'link'];
    if (contentType && validTypes.includes(contentType)) {
      sql += ` AND c.content_type = ?`;
      params.push(contentType);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const [rows] = await db.execute(sql, params);
    return rows;
  }

  //  PERFIL DE USUARIO 
  // Muestra el perfil de un usuario con sus creaciones e interacciones
  async getUserProfile(userId) {

    // Datos básicos del usuario
    const userSql = `
      SELECT user_id, first_name, last_name, email, role, created_at
      FROM users
      WHERE user_id = ?
    `;

    // Contenido publicado por el usuario
    const contentSql = `
      SELECT content_id, title, content_type, file_url, created_at
      FROM content
      WHERE user_id = ? AND is_published = TRUE
      ORDER BY created_at DESC
    `;

    // Productos publicados por el usuario
    const productsSql = `
      SELECT product_id, name, price, image_url, created_at
      FROM products
      WHERE user_id = ? AND is_available = TRUE
      ORDER BY created_at DESC
    `;

    // Comentarios hechos por el usuario
    const commentsSql = `
      SELECT
        c.comment_id,
        c.body,
        c.item_type,
        c.item_id,
        c.created_at
      FROM comments c
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    // ejecucion de todas las consultas en paralelo
    const [user, content, products, comments] = await Promise.all([
      db.execute(userSql,     [userId]),
      db.execute(contentSql,  [userId]),
      db.execute(productsSql, [userId]),
      db.execute(commentsSql, [userId])
    ]);

    if (!user[0][0]) return null;

    //  perfil completo
    return {
      profile:  user[0][0],
      content:  content[0],
      products: products[0],
      comments: comments[0],
      stats: {
        totalContent:  content[0].length,
        totalProducts: products[0].length,
        totalComments: comments[0].length
      }
    };
  }
}

module.exports = new SearchModel();
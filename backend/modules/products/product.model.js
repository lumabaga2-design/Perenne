// backend/modules/products/product.model.js

const db = require('../../config/db');

class ProductModel {

  //  INSERCIÓN 
  async createProduct(productData) {
    const { userId, name, description, price, stock, imageUrl } = productData;
    const sql = `
      INSERT INTO products (user_id, name, description, price, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      userId, name, description, price, stock || 0, imageUrl || null
    ]);
    return result;
  }

  //  CONSULTA TODOS 
  // Para la sección de productos disponibles
  async getAllProducts() {
    const sql = `
      SELECT
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        u.first_name AS seller_first_name,
        u.last_name  AS seller_last_name
      FROM products p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.is_available = TRUE
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA UNO 
  async getProductById(productId) {
    const sql = `
      SELECT p.*, u.first_name AS seller_first_name, u.last_name AS seller_last_name
      FROM products p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.product_id = ?
    `;
    const [rows] = await db.execute(sql, [productId]);
    return rows[0];
  }

  //  ACTUALIZACIÓN 
  async updateProduct(productId, productData) {
    const { name, description, price, stock, imageUrl, isAvailable } = productData;
    const sql = `
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, is_available = ?
      WHERE product_id = ?
    `;
    const [result] = await db.execute(sql, [
      name, description, price, stock, imageUrl || null, isAvailable, productId
    ]);
    return result;
  }

  //  ELIMINACIÓN 
  async deleteProduct(productId) {
    const sql = `DELETE FROM products WHERE product_id = ?`;
    const [result] = await db.execute(sql, [productId]);
    return result;
  }
}

module.exports = new ProductModel();
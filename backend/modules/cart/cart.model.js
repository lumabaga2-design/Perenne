// backend/modules/cart/cart.model.js

const db = require('../../config/db');

class CartModel {

  //  INSERCIÓN 
  // agregar un producto al carrito del usuario
  async addToCart(cartData) {
    const { userId, productId, quantity } = cartData;
    const sql = `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      -- Si el producto ya está en el carrito, solo suma la cantidad
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;
    const [result] = await db.execute(sql, [userId, productId, quantity || 1]);
    return result;
  }

  //  CONSULTA 
  // busca todos los productos en el carrito de un usuario
  async getCartByUser(userId) {
    const sql = `
      SELECT
        c.cart_id,
        c.quantity,
        c.added_at,
        p.product_id,
        p.name,
        p.price,
        p.image_url,
        -- Calculamos el subtotal por producto directamente en SQL
        (p.price * c.quantity) AS subtotal
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
      ORDER BY c.added_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  //  ACTUALIZACIÓN 
  // Cambiar la cantidad de un producto en el carrito
  async updateCartQuantity(cartId, quantity) {
    const sql = `UPDATE cart SET quantity = ? WHERE cart_id = ?`;
    const [result] = await db.execute(sql, [quantity, cartId]);
    return result;
  }

  //  ELIMINACIÓN UNO 
  // Quitar un producto del carrito
  async removeFromCart(cartId) {
    const sql = `DELETE FROM cart WHERE cart_id = ?`;
    const [result] = await db.execute(sql, [cartId]);
    return result;
  }

  //  ELIMINACIÓN TOTAL 
  // Vaciar todo el carrito del usuario 
  async clearCart(userId) {
    const sql = `DELETE FROM cart WHERE user_id = ?`;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }
}

module.exports = new CartModel();
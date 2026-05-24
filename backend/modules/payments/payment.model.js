// backend/modules/payments/payment.model.js

const db = require('../../config/db');

class PaymentModel {

  //  INSERCIÓN 
  // registro de  un nuevo pago en la base de datos
  async createPayment(paymentData) {
    const { userId, amount, paymentMethod, status, reference, notes } = paymentData;

    const sql = `
      INSERT INTO payments (user_id, amount, payment_method, status, reference, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      userId,
      amount,
      paymentMethod,
      status      || 'pending', // Si no se envía estado, queda como pendiente
      reference   || null,
      notes       || null
    ]);
    return result;
  }

  //  CONSULTA TODOS 
  //  todo el historial de pagos con el nombre del usuario
  async getAllPayments() {
    const sql = `
      SELECT
        p.payment_id,
        p.amount,
        p.payment_method,
        p.status,
        p.reference,
        p.notes,
        p.payment_date,
        u.first_name  AS user_first_name,
        u.last_name   AS user_last_name,
        u.email       AS user_email
      FROM payments p
      -- JOIN trae el nombre del usuario relacionado con ese pago
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA POR USUARIO 
  // Historial de pagos de un usuario específico
  async getPaymentsByUser(userId) {
    const sql = `
      SELECT
        p.payment_id,
        p.amount,
        p.payment_method,
        p.status,
        p.reference,
        p.notes,
        p.payment_date
      FROM payments p
      WHERE p.user_id = ?
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }

  //  CONSULTA POR ESTADO 
  // Filtra pagos por estado: pending, completed o rejected
  async getPaymentsByStatus(status) {
    const sql = `
      SELECT
        p.payment_id,
        p.amount,
        p.payment_method,
        p.status,
        p.reference,
        p.notes,
        p.payment_date,
        u.first_name  AS user_first_name,
        u.last_name   AS user_last_name
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.status = ?
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await db.execute(sql, [status]);
    return rows;
  }

  //  CONSULTA UNO 
  // Busca un pago específico por su id
  async getPaymentById(paymentId) {
    const sql = `
      SELECT
        p.*,
        u.first_name  AS user_first_name,
        u.last_name   AS user_last_name,
        u.email       AS user_email
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.payment_id = ?
    `;
    const [rows] = await db.execute(sql, [paymentId]);
    return rows[0];
  }

  //  ACTUALIZACIÓN DE ESTADO 
  // Cambia el estado de un pago
  async updatePaymentStatus(paymentId, status, notes) {
    const sql = `
      UPDATE payments
      SET status = ?, notes = ?
      WHERE payment_id = ?
    `;
    const [result] = await db.execute(sql, [status, notes || null, paymentId]);
    return result;
  }

  //  ELIMINACIÓN 
  // Elimina un pago del historial
  async deletePayment(paymentId) {
    const sql = `DELETE FROM payments WHERE payment_id = ?`;
    const [result] = await db.execute(sql, [paymentId]);
    return result;
  }
}

module.exports = new PaymentModel();
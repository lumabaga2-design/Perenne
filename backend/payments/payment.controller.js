// backend/modules/payments/payment.controller.js

const paymentModel = require('./payment.model');

const VALID_METHODS  = ['cash', 'transfer', 'card', 'other'];
const VALID_STATUSES = ['pending', 'completed', 'rejected'];

class PaymentController {

  //  INSERCIÓN 
  async createPayment(req, res) {
    try {
      const { userId, amount, paymentMethod, status } = req.body;

      // Validamos campos obligatorios
      if (!userId || !amount || !paymentMethod) {
        return res.status(400).json({
          message: 'userId, amount y paymentMethod son obligatorios'
        });
      }

      // se valida que sea un número mayor a 0
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          message: 'El monto debe ser un número mayor a 0'
        });
      }

      // validación de que el método de pago sea válido
      if (!VALID_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
          message: `Método de pago no válido. Debe ser: ${VALID_METHODS.join(', ')}`
        });
      }

      // validación de que el estado sea válido
      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Estado no válido. Debe ser: ${VALID_STATUSES.join(', ')}`
        });
      }

      const result = await paymentModel.createPayment(req.body);
      res.status(201).json({
        message: 'Pago registrado exitosamente',
        paymentId: result.insertId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar el pago', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllPayments(req, res) {
    try {
      const payments = await paymentModel.getAllPayments();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
    }
  }

  //  CONSULTA POR USUARIO 
  async getPaymentsByUser(req, res) {
    try {
      const payments = await paymentModel.getPaymentsByUser(req.params.userId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pagos del usuario', error: error.message });
    }
  }

  //  CONSULTA POR ESTADO 
  async getPaymentsByStatus(req, res) {
    try {
      const { status } = req.params;

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Estado no válido. Debe ser: ${VALID_STATUSES.join(', ')}`
        });
      }

      const payments = await paymentModel.getPaymentsByStatus(status);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
    }
  }

  //  CONSULTA UNO 
  async getPaymentById(req, res) {
    try {
      const payment = await paymentModel.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el pago', error: error.message });
    }
  }

  //  ACTUALIZACIÓN DE ESTADO 
  async updatePaymentStatus(req, res) {
    try {
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'El estado es obligatorio' });
      }

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Estado no válido. Debe ser: ${VALID_STATUSES.join(', ')}`
        });
      }

      const result = await paymentModel.updatePaymentStatus(req.params.id, status, notes);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      res.status(200).json({ message: 'Estado del pago actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el pago', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deletePayment(req, res) {
    try {
      const result = await paymentModel.deletePayment(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      res.status(200).json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el pago', error: error.message });
    }
  }
}

module.exports = new PaymentController();
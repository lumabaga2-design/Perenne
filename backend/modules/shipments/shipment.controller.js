// backend/modules/shipments/shipment.controller.js

const shipmentModel = require('./shipment.model');

const VALID_STATUSES = ['preparing', 'shipped', 'in_transit', 'delivered', 'returned'];

class ShipmentController {

  //  INSERCIÓN 
  async createShipment(req, res) {
    try {
      const { paymentId, customerId, collaboratorId, address, city, department } = req.body;

      // validación campos obligatorios
      if (!paymentId || !customerId || !collaboratorId || !address || !city || !department) {
        return res.status(400).json({
          message: 'paymentId, customerId, collaboratorId, address, city y department son obligatorios'
        });
      }

      const result = await shipmentModel.createShipment(req.body);
      res.status(201).json({
        message:      'Envío creado exitosamente',
        shipmentId:   result.insertId,
        trackingCode: result.trackingCode  // Devolvemos el código para que el colaborador lo comparta
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el envío', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllShipments(req, res) {
    try {
      const shipments = await shipmentModel.getAllShipments();
      res.status(200).json(shipments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los envíos', error: error.message });
    }
  }

  //  CONSULTA POR CLIENTE 
  async getShipmentsByCustomer(req, res) {
    try {
      const shipments = await shipmentModel.getShipmentsByCustomer(req.params.customerId);
      res.status(200).json(shipments);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los envíos del cliente', error: error.message });
    }
  }

  //  RASTREO POR CÓDIGO DEL SISTEMA 
  async trackByCode(req, res) {
    try {
      const result = await shipmentModel.trackByCode(req.params.trackingCode);
      if (!result) {
        return res.status(404).json({ message: 'Código de rastreo no encontrado' });
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error al rastrear el envío', error: error.message });
    }
  }

  //  RASTREO POR GUÍA DE TRANSPORTADORA 
  async trackByCarrierCode(req, res) {
    try {
      const result = await shipmentModel.trackByCarrierCode(req.params.carrierTracking);
      if (!result) {
        return res.status(404).json({ message: 'Número de guía no encontrado' });
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error al rastrear el envío', error: error.message });
    }
  }

  //  ACTUALIZACIÓN DE ESTADO 
  async updateShipmentStatus(req, res) {
    try {
      const { status, description, location } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'El estado es obligatorio' });
      }

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Estado no válido. Debe ser: ${VALID_STATUSES.join(', ')}`
        });
      }

      const result = await shipmentModel.updateShipmentStatus(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }
      res.status(200).json({ message: 'Estado del envío actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
  }

  //  ACTUALIZACIÓN DE GUÍA 
  async updateCarrierTracking(req, res) {
    try {
      const { carrierTracking, carrierName } = req.body;

      if (!carrierTracking) {
        return res.status(400).json({ message: 'El número de guía es obligatorio' });
      }

      const result = await shipmentModel.updateCarrierTracking(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }
      res.status(200).json({ message: 'Guía de transportadora actualizada exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la guía', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deleteShipment(req, res) {
    try {
      const result = await shipmentModel.deleteShipment(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Envío no encontrado' });
      }
      res.status(200).json({ message: 'Envío eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el envío', error: error.message });
    }
  }
}

module.exports = new ShipmentController();
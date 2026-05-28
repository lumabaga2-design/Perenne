// backend/modules/shipments/shipment.model.js

const db = require('../../config/db');

class ShipmentModel {

  //  GENERAR CÓDIGO DE RASTREO 
  // Genera un código único 
  generateTrackingCode() {
    const date   = new Date();
    const year   = date.getFullYear();
    const month  = String(date.getMonth() + 1).padStart(2, '0');
    const day    = String(date.getDate()).padStart(2, '0');

    // Generar 4 caracteres aleatorios en mayúsculas
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `SHP-${year}${month}${day}-${random}`;
  }

  //  INSERCIÓN 
  // Crea un nuevo envío y su primer registro de seguimiento
  async createShipment(shipmentData) {
    const {
      paymentId,
      customerId,
      collaboratorId,
      carrierTracking,
      carrierName,
      address,
      city,
      department,
      notes
    } = shipmentData;

    // Generamos el código único de rastreo del sistema
    const trackingCode = this.generateTrackingCode();

    const sql = `
      INSERT INTO shipments (
        payment_id, customer_id, collaborator_id,
        tracking_code, carrier_tracking, carrier_name,
        address, city, department, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      paymentId,
      customerId,
      collaboratorId,
      trackingCode,
      carrierTracking || null,
      carrierName     || null,
      address,
      city,
      department,
      notes           || null
    ]);

    // Creamos el primer registro de seguimiento automáticamente
    await this.addTrackingEvent(result.insertId, {
      status:      'preparing',
      description: 'Pedido recibido y en preparación',
      location:    city
    });

    return { ...result, trackingCode };
  }

  //  CONSULTA TODOS 
  // Para que el colaborador vea todos los envíos
  async getAllShipments() {
    const sql = `
      SELECT
        s.shipment_id,
        s.tracking_code,
        s.carrier_tracking,
        s.carrier_name,
        s.address,
        s.city,
        s.department,
        s.status,
        s.created_at,
        s.notes,
        c.first_name  AS customer_first_name,
        c.last_name   AS customer_last_name,
        u.first_name  AS collaborator_first_name,
        u.last_name   AS collaborator_last_name,
        p.amount      AS payment_amount
      FROM shipments s
      JOIN customers c ON s.customer_id    = c.customer_id
      JOIN users     u ON s.collaborator_id = u.user_id
      JOIN payments  p ON s.payment_id     = p.payment_id
      ORDER BY s.created_at DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  //  CONSULTA POR CLIENTE 
  // El cliente ve solo sus propios envíos
  async getShipmentsByCustomer(customerId) {
    const sql = `
      SELECT
        s.shipment_id,
        s.tracking_code,
        s.carrier_tracking,
        s.carrier_name,
        s.address,
        s.city,
        s.department,
        s.status,
        s.created_at
      FROM shipments s
      WHERE s.customer_id = ?
      ORDER BY s.created_at DESC
    `;
    const [rows] = await db.execute(sql, [customerId]);
    return rows;
  }

  //  RASTREO POR CÓDIGO DEL SISTEMA 
  // El cliente ingresa su código  y ve el historial
  async trackByCode(trackingCode) {
    // Primero buscamos el envío
    const shipmentSql = `
      SELECT
        s.shipment_id,
        s.tracking_code,
        s.carrier_tracking,
        s.carrier_name,
        s.address,
        s.city,
        s.department,
        s.status,
        s.created_at
      FROM shipments s
      WHERE s.tracking_code = ?
    `;
    const [shipment] = await db.execute(shipmentSql, [trackingCode]);

    if (!shipment[0]) return null;

    //  traemos todo el historial de seguimiento
    const trackingSql = `
      SELECT status, description, location, updated_at
      FROM shipment_tracking
      WHERE shipment_id = ?
      ORDER BY updated_at ASC
    `;
    const [trackingHistory] = await db.execute(trackingSql, [shipment[0].shipment_id]);

    // damos el envío con su historial incluido
    return { ...shipment[0], trackingHistory };
  }

  //  RASTREO POR GUÍA DE TRANSPORTADORA 
  // El cliente también puede buscar por número de guía
  async trackByCarrierCode(carrierTracking) {
    const shipmentSql = `
      SELECT
        s.shipment_id,
        s.tracking_code,
        s.carrier_tracking,
        s.carrier_name,
        s.status,
        s.city,
        s.created_at
      FROM shipments s
      WHERE s.carrier_tracking = ?
    `;
    const [shipment] = await db.execute(shipmentSql, [carrierTracking]);

    if (!shipment[0]) return null;

    const trackingSql = `
      SELECT status, description, location, updated_at
      FROM shipment_tracking
      WHERE shipment_id = ?
      ORDER BY updated_at ASC
    `;
    const [trackingHistory] = await db.execute(trackingSql, [shipment[0].shipment_id]);

    return { ...shipment[0], trackingHistory };
  }

  //  ACTUALIZACIÓN DE ESTADO 
  // El colaborador actualiza el estado y se guarda en el historial
  async updateShipmentStatus(shipmentId, statusData) {
    const { status, description, location } = statusData;

    // Actualizamos el estado actual del envío
    const updateSql = `
      UPDATE shipments SET status = ? WHERE shipment_id = ?
    `;
    const [result] = await db.execute(updateSql, [status, shipmentId]);

    // Guardamos el cambio en el historial de seguimiento
    await this.addTrackingEvent(shipmentId, { status, description, location });

    return result;
  }

  //  AGREGAR EVENTO DE SEGUIMIENTO 
  // Método interno que agrega una línea al historial
  async addTrackingEvent(shipmentId, eventData) {
    const { status, description, location } = eventData;
    const sql = `
      INSERT INTO shipment_tracking (shipment_id, status, description, location)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      shipmentId,
      status,
      description || null,
      location    || null
    ]);
    return result;
  }

  //  ACTUALIZACIÓN DE GUÍA 
  // El colaborador agrega el número de guía de la transportadora
  async updateCarrierTracking(shipmentId, carrierData) {
    const { carrierTracking, carrierName } = carrierData;
    const sql = `
      UPDATE shipments
      SET carrier_tracking = ?, carrier_name = ?
      WHERE shipment_id = ?
    `;
    const [result] = await db.execute(sql, [carrierTracking, carrierName || null, shipmentId]);
    return result;
  }

  //  ELIMINACIÓN 
  async deleteShipment(shipmentId) {
    // Primero eliminamos el historial relacionado
    await db.execute(`DELETE FROM shipment_tracking WHERE shipment_id = ?`, [shipmentId]);

    // Luego eliminamos el envío
    const [result] = await db.execute(`DELETE FROM shipments WHERE shipment_id = ?`, [shipmentId]);
    return result;
  }
}

module.exports = new ShipmentModel();
// backend/modules/customers/customer.model.js

// se importa la conexión a la base de datos
const db = require('../../config/db');

// Clase que agrupa todas las operaciones de base de datos para Clientes.

class CustomerModel {

  //  INSERCIÓN 
  // Recibe un objeto con los datos del cliente y lo inserta en la bd
  async createCustomer(customerData) {
    const { firstName, lastName, email, phone } = customerData;
    const sql = `
      INSERT INTO customers (first_name, last_name, email, phone)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(sql, [firstName, lastName, email, phone]);
    return result;
  }

  //  CONSULTA TODOS 
  // da todos los clientes de la tabla
  async getAllCustomers() {
    const sql = `SELECT * FROM customers ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows; // 
  }

  //  CONSULTA UNO 
  // Busca un cliente por su id
  async getCustomerById(customerId) {
    const sql = `SELECT * FROM customers WHERE customer_id = ?`;
    const [rows] = await db.execute(sql, [customerId]);
    return rows[0]; // Devolvemos solo el primer resultado
  }

  //  ACTUALIZACIÓN 
  // Actualizar los datos de un cliente existente según su id
  async updateCustomer(customerId, customerData) {
    const { firstName, lastName, email, phone } = customerData;
    const sql = `
      UPDATE customers
      SET first_name = ?, last_name = ?, email = ?, phone = ?
      WHERE customer_id = ?
    `;
    const [result] = await db.execute(sql, [firstName, lastName, email, phone, customerId]);
    return result;
  }

  //  ELIMINACIÓN 
  // Elimina un cliente de la bd según su id
  async deleteCustomer(customerId) {
    const sql = `DELETE FROM customers WHERE customer_id = ?`;
    const [result] = await db.execute(sql, [customerId]);
    return result;
  }
}

module.exports = new CustomerModel();
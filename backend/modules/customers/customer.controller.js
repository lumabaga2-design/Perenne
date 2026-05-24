// backend/modules/customers/customer.controller.js

const customerModel = require('./customer.model');


// Recibe req (request = petición) y res (response = respuesta).
class CustomerController {

  //  INSERCIÓN 
  async createCustomer(req, res) {
    try {
      const result = await customerModel.createCustomer(req.body);
      res.status(201).json({
        message: 'Cliente creado exitosamente',
        customerId: result.insertId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el cliente', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllCustomers(req, res) {
    try {
      const customers = await customerModel.getAllCustomers();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los clientes', error: error.message });
    }
  }

  //  CONSULTA UNO 
  async getCustomerById(req, res) {
    try {
      const customer = await customerModel.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el cliente', error: error.message });
    }
  }

  //  ACTUALIZACIÓN 
  async updateCustomer(req, res) {
    try {
      const result = await customerModel.updateCustomer(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      res.status(200).json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deleteCustomer(req, res) {
    try {
      const result = await customerModel.deleteCustomer(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
  }
}

module.exports = new CustomerController();
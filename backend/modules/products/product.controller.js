// backend/modules/products/product.controller.js

const productModel = require('./product.model');

class ProductController {

  //  INSERCIÓN 
  async createProduct(req, res) {
    try {
      const { userId, name, price } = req.body;

      if (!userId || !name || !price) {
        return res.status(400).json({ message: 'userId, name y price son obligatorios' });
      }

      // se valida que el precio sea un número positivo
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
      }

      const result = await productModel.createProduct(req.body);
      res.status(201).json({
        message: 'Producto creado exitosamente',
        productId: result.insertId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
  }

  //  CONSULTA TODOS 
  async getAllProducts(req, res) {
    try {
      const products = await productModel.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
  }

  //  CONSULTA UNO 
  async getProductById(req, res) {
    try {
      const product = await productModel.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
  }

  //  ACTUALIZACIÓN 
  async updateProduct(req, res) {
    try {
      const result = await productModel.updateProduct(req.params.id, req.body);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
  }

  //  ELIMINACIÓN 
  async deleteProduct(req, res) {
    try {
      const result = await productModel.deleteProduct(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
  }
}

module.exports = new ProductController();
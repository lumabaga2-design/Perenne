// backend/modules/cart/cart.controller.js

const cartModel = require('./cart.model');

class CartController {

  //  INSERCIÓN 
  async addToCart(req, res) {
    try {
      const { userId, productId, quantity } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({ message: 'userId y productId son obligatorios' });
      }

      if (quantity && quantity <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
      }

      await cartModel.addToCart(req.body);
      res.status(201).json({ message: 'Producto agregado al carrito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al agregar al carrito', error: error.message });
    }
  }

  //  CONSULTA 
  async getCartByUser(req, res) {
    try {
      const cartItems = await cartModel.getCartByUser(req.params.userId);
      res.status(200).json(cartItems);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el carrito', error: error.message });
    }
  }

  //  ACTUALIZACIÓN 
  async updateCartQuantity(req, res) {
    try {
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
      }

      const result = await cartModel.updateCartQuantity(req.params.cartId, quantity);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item del carrito no encontrado' });
      }
      res.status(200).json({ message: 'Cantidad actualizada' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el carrito', error: error.message });
    }
  }

  //  ELIMINACIÓN UNO 
  async removeFromCart(req, res) {
    try {
      const result = await cartModel.removeFromCart(req.params.cartId);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item del carrito no encontrado' });
      }
      res.status(200).json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar del carrito', error: error.message });
    }
  }

  //  ELIMINACIÓN TOTAL 
  async clearCart(req, res) {
    try {
      await cartModel.clearCart(req.params.userId);
      res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al vaciar el carrito', error: error.message });
    }
  }
}

module.exports = new CartController();
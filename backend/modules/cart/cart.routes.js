// backend/modules/cart/cart.routes.js

const express         = require('express');
const router          = express.Router();
const cartController  = require('./cart.controller');

router.post('/',                       (req, res) => cartController.addToCart(req, res));
router.get('/:userId',                 (req, res) => cartController.getCartByUser(req, res));
router.patch('/:cartId/quantity',      (req, res) => cartController.updateCartQuantity(req, res));
router.delete('/:cartId',              (req, res) => cartController.removeFromCart(req, res));
router.delete('/clear/:userId',        (req, res) => cartController.clearCart(req, res));

module.exports = router;
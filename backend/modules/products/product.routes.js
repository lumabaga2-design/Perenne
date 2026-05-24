// backend/modules/products/product.routes.js

const express            = require('express');
const router             = express.Router();
const productController  = require('./product.controller');

router.post('/',     (req, res) => productController.createProduct(req, res));
router.get('/',      (req, res) => productController.getAllProducts(req, res));
router.get('/:id',   (req, res) => productController.getProductById(req, res));
router.put('/:id',   (req, res) => productController.updateProduct(req, res));
router.delete('/:id',(req, res) => productController.deleteProduct(req, res));

module.exports = router;
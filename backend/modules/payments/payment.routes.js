// backend/modules/payments/payment.routes.js

const express           = require('express');
const router            = express.Router();
const paymentController = require('./payment.controller');

router.post('/',                    (req, res) => paymentController.createPayment(req, res));
router.get('/',                     (req, res) => paymentController.getAllPayments(req, res));
router.get('/user/:userId',         (req, res) => paymentController.getPaymentsByUser(req, res));
router.get('/status/:status',       (req, res) => paymentController.getPaymentsByStatus(req, res));
router.get('/:id',                  (req, res) => paymentController.getPaymentById(req, res));
router.patch('/:id/status',         (req, res) => paymentController.updatePaymentStatus(req, res));
router.delete('/:id',               (req, res) => paymentController.deletePayment(req, res));

module.exports = router;
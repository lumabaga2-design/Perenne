// backend/modules/shipments/shipment.routes.js

const express             = require('express');
const router              = express.Router();
const shipmentController  = require('./shipment.controller');


router.post('/',                              (req, res) => shipmentController.createShipment(req, res));
router.get('/',                               (req, res) => shipmentController.getAllShipments(req, res));
router.get('/customer/:customerId',           (req, res) => shipmentController.getShipmentsByCustomer(req, res));
router.get('/track/:trackingCode',            (req, res) => shipmentController.trackByCode(req, res));
router.get('/carrier/:carrierTracking',       (req, res) => shipmentController.trackByCarrierCode(req, res));
router.patch('/:id/status',                   (req, res) => shipmentController.updateShipmentStatus(req, res));
router.patch('/:id/carrier',                  (req, res) => shipmentController.updateCarrierTracking(req, res));
router.delete('/:id',                         (req, res) => shipmentController.deleteShipment(req, res));

module.exports = router;
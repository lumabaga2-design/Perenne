// backend/modules/notifications/notification.routes.js

const express                   = require('express');
const router                    = express.Router();
const notificationController    = require('./notification.controller');


router.get('/:userId',                        (req, res) => notificationController.getNotificationsByUser(req, res));
router.get('/:userId/unread',                 (req, res) => notificationController.getUnreadNotifications(req, res));
router.get('/:userId/count',                  (req, res) => notificationController.countUnreadNotifications(req, res));
router.patch('/:notificationId/read',         (req, res) => notificationController.markAsRead(req, res));
router.patch('/:userId/read-all',             (req, res) => notificationController.markAllAsRead(req, res));
router.delete('/:notificationId',             (req, res) => notificationController.deleteNotification(req, res));
router.delete('/:userId/all',                 (req, res) => notificationController.deleteAllNotifications(req, res));

module.exports = router;
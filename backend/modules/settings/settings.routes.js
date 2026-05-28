// backend/modules/settings/settings.routes.js

const express             = require('express');
const router              = express.Router();
const settingsController  = require('./settings.controller');


router.get('/:userId/profile',          (req, res) => settingsController.getProfile(req, res));
router.patch('/:userId/basic',          (req, res) => settingsController.updateBasicInfo(req, res));
router.patch('/:userId/public-profile', (req, res) => settingsController.updatePublicProfile(req, res));
router.patch('/:userId/privacy',        (req, res) => settingsController.updatePrivacy(req, res));
router.patch('/:userId/email',          (req, res) => settingsController.updateEmail(req, res));
router.patch('/:userId/password',       (req, res) => settingsController.updatePassword(req, res));

router.get('/:userId/preferences',      (req, res) => settingsController.getSettings(req, res));
router.patch('/:userId/notifications',  (req, res) => settingsController.updateNotificationSettings(req, res));
router.patch('/:userId/interface',      (req, res) => settingsController.updateInterfaceSettings(req, res));

router.patch('/:userId/deactivate',     (req, res) => settingsController.deactivateAccount(req, res));
router.patch('/:userId/reactivate',     (req, res) => settingsController.reactivateAccount(req, res));
router.delete('/:userId/delete',        (req, res) => settingsController.deleteAccount(req, res));

module.exports = router;
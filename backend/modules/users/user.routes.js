// backend/modules/users/user.routes.js

const express        = require('express');
const router         = express.Router();
const userController = require('./user.controller');

router.post('/',                  (req, res) => userController.createUser(req, res));
router.get('/',                   (req, res) => userController.getAllUsers(req, res));
router.get('/:id',                (req, res) => userController.getUserById(req, res));
router.put('/:id',                (req, res) => userController.updateUser(req, res));
router.patch('/:id/password',     (req, res) => userController.updateUserPassword(req, res));
router.delete('/:id',             (req, res) => userController.deleteUser(req, res));

module.exports = router;
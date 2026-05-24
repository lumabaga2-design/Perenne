// backend/modules/content/content.routes.js

const express           = require('express');
const router            = express.Router();
const contentController = require('./content.controller');

router.post('/',                      (req, res) => contentController.createContent(req, res));
router.get('/',                       (req, res) => contentController.getAllContent(req, res));
router.get('/type/:contentType',      (req, res) => contentController.getContentByType(req, res));
router.get('/:id',                    (req, res) => contentController.getContentById(req, res));
router.put('/:id',                    (req, res) => contentController.updateContent(req, res));
router.delete('/:id',                 (req, res) => contentController.deleteContent(req, res));

module.exports = router;
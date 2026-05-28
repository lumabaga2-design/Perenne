// backend/modules/interactions/interaction.routes.js

const express                 = require('express');
const router                  = express.Router();
const interactionController   = require('./interaction.controller');


router.post('/likes',                               (req, res) => interactionController.toggleLike(req, res));
router.get('/likes/:itemType/:itemId',              (req, res) => interactionController.getLikeCount(req, res));

router.post('/comments',                            (req, res) => interactionController.createComment(req, res));
router.get('/comments/:itemType/:itemId',           (req, res) => interactionController.getCommentsByItem(req, res));
router.put('/comments/:commentId',                  (req, res) => interactionController.updateComment(req, res));
router.delete('/comments/:commentId',               (req, res) => interactionController.deleteComment(req, res));

router.post('/shares',                              (req, res) => interactionController.createShare(req, res));
router.get('/share/:shareCode',                     (req, res) => interactionController.resolveShareCode(req, res));
router.get('/shares/:itemType/:itemId',             (req, res) => interactionController.getShareCount(req, res));

module.exports = router;
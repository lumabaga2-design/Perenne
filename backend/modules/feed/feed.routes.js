// backend/modules/feed/feed.routes.js

const express         = require('express');
const router          = express.Router();
const feedController  = require('./feed.controller');

router.get('/',         (req, res) => feedController.getFeed(req, res));
router.get('/explore',  (req, res) => feedController.getExploreContent(req, res));

module.exports = router;
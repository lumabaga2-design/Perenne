// backend/modules/search/search.routes.js

const express           = require('express');
const router            = express.Router();
const searchController  = require('./search.controller');


router.get('/',                 (req, res) => searchController.globalSearch(req, res));
router.get('/users',            (req, res) => searchController.searchUsers(req, res));
router.get('/products',         (req, res) => searchController.searchProducts(req, res));
router.get('/content',          (req, res) => searchController.searchContent(req, res));
router.get('/profile/:userId',  (req, res) => searchController.getUserProfile(req, res));

module.exports = router;
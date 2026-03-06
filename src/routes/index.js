const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

const aiController = require('../controllers/aiController');

router.post('/upload', uploadController.uploadFile);
router.post('/api/wish/fulfill', aiController.fulfillWish);
module.exports = router;

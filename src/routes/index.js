const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const aiController = require('../controllers/aiController');
const postController = require('../controllers/postController');
const { requireInternalAuth } = require('../utils/authMiddleware');

router.post('/upload', uploadController.uploadFile);
router.post('/api/wish/fulfill', aiController.fulfillWish);

// Educated Wish Central API Routes
router.post('/api/v1/generate', requireInternalAuth, aiController.generateContent);

const { boardAuthMiddleware } = require('../utils/boardAuth');

router.get('/api/posts', postController.getPosts);
router.post('/api/posts', boardAuthMiddleware, postController.createPost);
router.post('/api/posts/update', postController.updatePost);

module.exports = router;

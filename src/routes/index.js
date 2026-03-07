const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const aiController = require('../controllers/aiController');
const postController = require('../controllers/postController');

router.post('/upload', uploadController.uploadFile);
router.post('/api/wish/fulfill', aiController.fulfillWish);

router.get('/api/posts', postController.getPosts);
router.post('/api/posts', postController.createPost);
router.post('/api/posts/update', postController.updatePost);

module.exports = router;

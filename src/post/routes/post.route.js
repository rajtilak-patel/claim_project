const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/middleware/auth.middleware');
const {
  createPost,
  getAllPosts,
  incrementLikes,
  incrementViews
} = require('../controller/post.controller');
const upload = require('../../middleware/multer.middleware');

router.post('/', verifyToken,upload.single('mediaProof'), createPost);
router.get('/', getAllPosts);
router.patch('/:id/like', incrementLikes);
router.patch('/:id/view', incrementViews);

module.exports = router;

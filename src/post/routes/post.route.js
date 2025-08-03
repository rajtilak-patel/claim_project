const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/middleware/auth.middleware');
const {
  createPost,
  getPosts,
  getAllPosts,
  incrementLikes,
  incrementViews
} = require('../controller/post.controller');
const upload = require('../../middleware/multer.middleware');

router.post('/', verifyToken,upload.single('mediaProof'), createPost);
router.get('/',verifyToken, getPosts);
router.get('/list', verifyToken, getAllPosts); // Alias for getAllPosts
router.patch('/:id/like', verifyToken, incrementLikes);
router.patch('/:id/view', verifyToken, incrementViews);

module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const fileUploadUtil = require('../utils/fileUploadUtils');
const {verifyToken} = require('../middleware/authMiddleware');

// Configure upload middleware
const postUpload = fileUploadUtil.createUploader({
  subfolder: 'posts',
  fieldName: 'media',
  fileType: 'image', // Default, can be overridden
  maxSize: 5 * 1024 * 1024 // 5MB
});

// Create a new post
router.post(
  '/', 
  verifyToken, // Max 5 files
  postController.createPost
);

// Get a single post
router.get('/:id', postController.viewPost);

// Get multiple posts with filters
router.get('/', postController.viewPosts);

// Delete a post
router.delete('/:id', verifyToken, postController.deletePost);

// Vote on a post
router.post('/:id/vote', verifyToken, postController.votePost);

// Accept an answer (for Q&A)
router.post('/:id/accept-answer', verifyToken, postController.acceptAnswer);

module.exports = router;
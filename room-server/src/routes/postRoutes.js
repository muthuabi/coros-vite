const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const fileUploadUtil = require('../utils/fileUploadUtils');
const { verifyToken } = require('../middleware/authMiddleware');

// Dynamic upload middleware
const dynamicUpload = (req, res, next) => {
  const postType = req.body.type; // 'image', 'video', 'document'

  // Map post types to allowed file categories
  const typeMap = {
    image: ['image'],
    video: ['video'],
    document: ['document'],
    generic: ['image', 'video', 'document'] // For mixed types
  };

  const fileTypes = typeMap[postType] || ['image']; // Default to image

  const uploader = fileUploadUtil.createUploader({
    subfolder: 'posts',
    idSubFolder: 'media',
    fieldName: 'media',
    fileTypes,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  uploader(req, res, (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    next();
  });
};

// Create a new post
router.post(
  '/', 
  verifyToken,
  dynamicUpload,
  postController.createPost
);

// Update a post
router.put(
  '/:id',
  verifyToken,
  dynamicUpload,
  postController.updatePost
);

// Other routes remain unchanged
router.get('/:id', postController.viewPost);
router.get('/', postController.viewPosts);
router.delete('/:id', verifyToken, postController.deletePost);
router.post('/:id/vote', verifyToken, postController.votePost);
router.post('/:id/accept-answer', verifyToken, postController.acceptAnswer);
// Add these routes
router.post('/:id/like', verifyToken, postController.likePost);
router.post('/:id/view', postController.trackView);

module.exports = router;
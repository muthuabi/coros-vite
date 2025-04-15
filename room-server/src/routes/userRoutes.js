const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');  // Ensure the user is logged in

// Import the user controller functions
const {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  followUser,
  unfollowUser,
  getCurrentUser
} = require('../controllers/userController');
// Get user by ID
router.get('/:id', verifyToken, getUserById);

// Update user data
router.put('/:id', verifyToken, updateUser);

// Delete user (soft delete)
router.delete('/:id', verifyToken, deleteUser);

// Get all users (admin only)
router.get('/', verifyToken, getAllUsers);

// Follow another user
router.put('/follow/:id', verifyToken, followUser);

// Unfollow another user
router.put('/unfollow/:id', verifyToken, unfollowUser);

module.exports = router;

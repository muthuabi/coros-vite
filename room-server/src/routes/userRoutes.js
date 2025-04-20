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
  getCurrentUser,
  editProfile
} = require('../controllers/userController');

// Static and specific routes first
router.put("/edit-profile", verifyToken, editProfile);
router.put("/follow/:id", verifyToken, followUser);
router.put("/unfollow/:id", verifyToken, unfollowUser);

// Routes with no parameters but unique purpose
router.get("/me", verifyToken, getCurrentUser); // If you have this
router.get("/", verifyToken, getAllUsers);

// Dynamic parameterized routes last
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);


module.exports = router;

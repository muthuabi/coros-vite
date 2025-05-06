const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// User profile routes
router.put("/edit-profile", verifyToken, userController.editProfile);
router.get("/me", verifyToken, userController.getCurrentUser);

// Follow/unfollow routes
router.put("/follow/:id", verifyToken, userController.followUser);
router.put("/unfollow/:id", verifyToken, userController.unfollowUser);

// Admin routes
router.get("/", verifyToken, authorizeRoles(['admin']), userController.getAllUsers);
router.get('/:id', verifyToken, authorizeRoles(['admin']), userController.getUserById);
router.put('/:id', verifyToken, authorizeRoles(['admin']), userController.updateUser);
router.delete('/:id', verifyToken, authorizeRoles(['admin']), userController.deleteUser);

module.exports = router;
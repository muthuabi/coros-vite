const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const {verifyToken} = require('../middleware/authMiddleware');

// Public routes
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoom);

// Protected routes (require authentication)
router.use(verifyToken);

// Room management
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

// Cover image handling
router.post('/:id/cover', roomController.uploadCover);
router.delete('/:id/cover', roomController.deleteCover);

// Membership management
router.post('/:id/join', roomController.joinRoom);
router.post('/:id/leave', roomController.leaveRoom);
router.post('/:id/requests', roomController.handleJoinRequest);
router.get('/:id/requests', roomController.getJoinRequests);

// Admin management
router.post('/:id/admins', roomController.manageAdmin);

// Member list
router.get('/:id/members', roomController.getMembers);

// Post pinning
router.post('/:id/pin', roomController.togglePinPost);

module.exports = router;
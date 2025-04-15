const express = require('express');
const router = express.Router();
const { getRoomDetails, getAllRoomsByUserId, getAllRooms, updateRoomDetails } = require('../controllers/roomController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/room/:roomId', verifyToken, getRoomDetails);

router.get('/user/:userId/rooms', verifyToken, getAllRoomsByUserId);

router.get('/rooms', verifyToken, authorizeRoles('admin'), getAllRooms);

router.put('/room/:roomId', verifyToken, authorizeRoles('admin'), updateRoomDetails);

module.exports = router;

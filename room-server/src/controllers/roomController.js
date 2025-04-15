const Room = require('../models/Room');
const User = require('../models/User');

const getRoomDetails = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId)
      .populate('createdBy', 'username email')
      .populate('admins', 'username email')
      .populate('members', 'username email')
      .populate('posts', 'content createdAt')
      .populate('tags')
      .exec();

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllRoomsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const rooms = await Room.find({
      $or: [{ admins: userId }, { members: userId }],
    })
      .populate('admins', 'username email')
      .populate('members', 'username email')
      .populate('tags')
      .exec();

    if (!rooms.length) {
      return res.status(404).json({
        success: false,
        message: 'No rooms found for this user',
      });
    }

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// 3. Get All Room Details (for admins or general listing)
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('admins', 'username email')
      .populate('members', 'username email')
      .populate('tags')
      .exec();

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// 4. Update Room Details
const updateRoomDetails = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const updateData = req.body;

    // Find room and check if user is admin
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Only allow admins to update room details
    if (!room.admins.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this room',
      });
    }

    // Update the room data
    Object.assign(room, updateData);
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getRoomDetails,
  getAllRoomsByUserId,
  getAllRooms,
  updateRoomDetails,
};

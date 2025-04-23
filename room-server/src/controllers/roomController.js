const Room = require('../models/Room');
const User = require('../models/User');
const Post = require('../models/Post');
const { createUploader, deleteFile, getRelativePath } = require('../utils/fileUploadUtils');
const path = require('path');
const fs = require('fs');

// Configure file upload for room covers
const uploadCover = createUploader({
  subfolder: 'rooms',
  idSubFolder: 'cover',
  fileTypes: ['image'],
  fieldName: 'cover',
  maxSize: 5 * 1024 * 1024 // 5MB
});

// Configure file upload for room media
const uploadMedia = createUploader({
  subfolder: 'rooms',
  idSubFolder: 'media',
  fileTypes: ['image', 'video'],
  fieldName: 'media',
  maxSize: 20 * 1024 * 1024 // 20MB
});

// Utility function to handle file uploads
const handleFileUpload = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large' });
        }
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'File upload failed' });
      }
      next();
    });
  };
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, description, roomType, tags } = req.body;
    const createdBy = req.user._id;

    const roomData = {
      name,
      description,
      roomType,
      tags: tags || [],
      createdBy
    };

    const room = await Room.createRoom(roomData, createdBy);

    // Add room to user's joined rooms
    await User.findByIdAndUpdate(createdBy, {
      $addToSet: { roomsJoined: room._id }
    });

    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Room name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get room by ID
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'username profilePic')
      .populate('admins', 'username profilePic')
      .populate('members', 'username profilePic');

    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user can access private room
    if (room.roomType === 'private' && 
        !room.isMember(req.user._id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied to private room' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update room details
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only admins or creator can update room
    if (!room.isAdmin(req.user._id)) {
      return res.status(403).json({ error: 'Only room admins can update room details' });
    }

    const { name, description, roomType, tags, visibility } = req.body;

    // Prevent changing room type if it has posts
    if (roomType && roomType !== room.roomType && room.postsCount > 0) {
      return res.status(400).json({ error: 'Cannot change room type after posts have been created' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (roomType) updates.roomType = roomType;
    if (tags) updates.tags = tags;
    if (typeof visibility === 'boolean') updates.visibility = visibility;

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedRoom);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Room name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Upload room cover image
exports.uploadCover = [
  handleFileUpload(uploadCover),
  async (req, res) => {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Only admins or creator can update cover
      if (!room.isAdmin(req.user._id)) {
        // Delete the uploaded file if permission denied
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({ error: 'Only room admins can update cover' });
      }

      // Delete old cover if exists
      if (room.cover && room.cover.publicId) {
        const fullPath = path.join(__dirname, '../files', room.cover.url);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      // Update room with new cover
      const relativePath = getRelativePath(req.file.path);
      room.cover = {
        url: relativePath,
        publicId: req.file.filename
      };

      await room.save();

      res.json({
        message: 'Cover uploaded successfully',
        cover: room.cover
      });
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  }
];

// Delete room cover
exports.deleteCover = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only admins or creator can delete cover
    if (!room.isAdmin(req.user._id)) {
      return res.status(403).json({ error: 'Only room admins can delete cover' });
    }

    if (!room.cover || !room.cover.url) {
      return res.status(400).json({ error: 'No cover image to delete' });
    }

    // Delete file from storage
    const fullPath = path.join(__dirname, '../files', room.cover.url);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove cover reference
    room.cover = undefined;
    await room.save();

    res.json({ message: 'Cover image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Soft delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only creator or admin can delete room
    if (!room.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only room creator or admin can delete room' });
    }

    // Soft delete the room
    await room.softDelete();

    // Remove room from users' joined rooms
    await User.updateMany(
      { roomsJoined: room._id },
      { $pull: { roomsJoined: room._id } }
    );

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms (with pagination and filtering)
exports.getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search, tag } = req.query;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false, visibility: true };

    if (type) query.roomType = type;
    if (tag) query.tags = tag;
    if (search) {
      query.$text = { $search: search };
    }

    const rooms = await Room.find(query)
      .sort({ engagementScore: -1, lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'username profilePic');

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join room or request to join
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const userId = req.user._id;

    // Check if already a member or admin
    if (room.isMember(userId)) {
      return res.status(400).json({ error: 'Already a member of this room' });
    }

    // Public room - join directly
    if (room.roomType === 'public') {
      await room.addMember(userId);
      
      // Add room to user's joined rooms
      await User.findByIdAndUpdate(userId, {
        $addToSet: { roomsJoined: room._id }
      });

      return res.json({ message: 'Joined room successfully' });
    }

    // Private room - send join request
    if (!room.joinRequests.includes(userId)) {
      room.joinRequests.push(userId);
      await room.save();
    }

    res.json({ message: 'Join request sent to room admins' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const userId = req.user._id;

    // Can't leave if not a member
    if (!room.isMember(userId)) {
      return res.status(400).json({ error: 'Not a member of this room' });
    }

    // Can't leave if you're the creator
    if (room.createdBy.equals(userId)) {
      return res.status(400).json({ error: 'Room creator cannot leave the room' });
    }

    // Remove from room
    await room.removeUser(userId);

    // Remove room from user's joined rooms
    await User.findByIdAndUpdate(userId, {
      $pull: { roomsJoined: room._id }
    });

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle join request (approve/reject)
exports.handleJoinRequest = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { userId, action } = req.body;

    // Only admins can handle join requests
    if (!room.isAdmin(req.user._id)) {
      return res.status(403).json({ error: 'Only room admins can handle join requests' });
    }

    await room.handleJoinRequest(userId, action);

    if (action === 'approve') {
      // Add room to user's joined rooms
      await User.findByIdAndUpdate(userId, {
        $addToSet: { roomsJoined: room._id }
      });
    }

    res.json({ message: `Join request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add/remove admin
exports.manageAdmin = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { userId, action } = req.body;

    // Only creator can manage admins
    if (!room.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only room creator can manage admins' });
    }

    // Can't manage yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot change your own admin status' });
    }

    if (action === 'add') {
      await room.addMember(userId, true); // Add as admin
    } else if (action === 'remove') {
      // Can't remove if not an admin
      if (!room.isAdmin(userId)) {
        return res.status(400).json({ error: 'User is not an admin' });
      }
      await room.removeUser(userId);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Admin ${action === 'add' ? 'added' : 'removed'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room members
exports.getMembers = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('admins', 'username profilePic lastActive')
      .populate('members', 'username profilePic lastActive');

    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only members can see members list for private rooms
    if (room.roomType === 'private' && !room.isMember(req.user._id)) {
      return res.status(403).json({ error: 'Access denied to members list' });
    }

    res.json({
      admins: room.admins,
      members: room.members
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get room join requests
exports.getJoinRequests = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('joinRequests', 'username profilePic createdAt');

    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Only admins can see join requests
    if (!room.isAdmin(req.user._id)) {
      return res.status(403).json({ error: 'Only admins can view join requests' });
    }

    res.json(room.joinRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pin/unpin post in room
exports.togglePinPost = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room || room.isDeleted) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { postId } = req.body;

    // Only admins can pin posts
    if (!room.isAdmin(req.user._id)) {
      return res.status(403).json({ error: 'Only admins can pin posts' });
    }

    // Verify post belongs to this room
    const post = await Post.findById(postId);
    if (!post || !post.roomId.equals(room._id)) {
      return res.status(400).json({ error: 'Post does not belong to this room' });
    }

    await room.togglePinPost(postId);

    // Update post's pinned status
    post.isPinned = room.pinnedPosts.includes(postId);
    await post.save();

    res.json({ 
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: post.isPinned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
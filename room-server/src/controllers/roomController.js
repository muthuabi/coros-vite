const Room = require('../models/Room');
const User = require('../models/User');
const Post = require('../models/Post');
const { createUploader, deleteFile, getRelativePath } = require('../utils/fileUploadUtils');
const path = require('path');
const fs = require('fs');

class RoomController {
  constructor() {
    // Configure file upload for room covers
    this.uploadCover = createUploader({
      subfolder: 'rooms',
      idSubFolder: 'cover',
      fileTypes: ['image'],
      fieldName: 'cover',
      maxSize: 5 * 1024 * 1024 // 5MB
    });

    // Configure file upload for room media
    this.uploadMedia = createUploader({
      subfolder: 'rooms',
      idSubFolder: 'media',
      fileTypes: ['image', 'video'],
      fieldName: 'media',
      maxSize: 20 * 1024 * 1024 // 20MB
    });
  }

  // Utility function to handle file uploads
  handleFileUpload(uploadFunction) {
    return (req, res, next) => {
      uploadFunction(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              success: false,
              error: 'File size too large',
              message: 'File exceeds maximum allowed size of 5MB'
            });
          }
          if (err.message.includes('Invalid file type')) {
            return res.status(400).json({ 
              success: false,
              error: err.message,
              message: 'Invalid file type uploaded'
            });
          }
          return res.status(500).json({ 
            success: false,
            error: 'File upload failed',
            message: 'Failed to process file upload'
          });
        }
        next();
      });
    };
  }

  // Create a new room
  async createRoom(req, res) {
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

      res.status(201).json({
        success: true,
        data: room,
        message: 'Room created successfully'
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          error: 'Duplicate room name',
          message: 'Room name already exists'
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create room'
      });
    }
  }

  // Get room by ID
  async getRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id)
        .populate('createdBy', 'username profilePic')
        .populate('admins', 'username profilePic')
        .populate('members', 'username profilePic');

      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Check if user can access private room
      if (room.roomType === 'private' && 
          !room.isMember(req.user._id) && 
          req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied',
          message: 'Access denied to private room'
        });
      }

      res.status(200).json({
        success: true,
        data: room,
        message: 'Room retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve room'
      });
    }
  }

  // Update room details
  async updateRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Only admins or creator can update room
      if (!room.isAdmin(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only room admins can update room details'
        });
      }

      const { name, description, roomType, tags, visibility } = req.body;

      // Prevent changing room type if it has posts
      if (roomType && roomType !== room.roomType && room.postsCount > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Bad request',
          message: 'Cannot change room type after posts have been created'
        });
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

      res.status(200).json({
        success: true,
        data: updatedRoom,
        message: 'Room updated successfully'
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          success: false,
          error: 'Duplicate room name',
          message: 'Room name already exists'
        });
      }
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to update room'
      });
    }
  }

  // Upload room cover image
  uploadCoverHandler = [
    this.handleFileUpload(this.uploadCover),
    async (req, res) => {
      try {
        const room = await Room.findById(req.params.id);
        if (!room || room.isDeleted) {
          return res.status(404).json({ 
            success: false,
            error: 'Not found',
            message: 'Room not found'
          });
        }

        // Only admins or creator can update cover
        if (!room.isAdmin(req.user._id)) {
          // Delete the uploaded file if permission denied
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(403).json({ 
            success: false,
            error: 'Forbidden',
            message: 'Only room admins can update cover'
          });
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

        res.status(200).json({
          success: true,
          data: room.cover,
          message: 'Cover uploaded successfully'
        });
      } catch (error) {
        // Clean up uploaded file if error occurs
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
          success: false,
          error: error.message,
          message: 'Failed to upload cover image'
        });
      }
    }
  ];

  // Delete room cover
  async deleteCover(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Only admins or creator can delete cover
      if (!room.isAdmin(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only room admins can delete cover'
        });
      }

      if (!room.cover || !room.cover.url) {
        return res.status(400).json({ 
          success: false,
          error: 'Bad request',
          message: 'No cover image to delete'
        });
      }

      // Delete file from storage
      const fullPath = path.join(__dirname, '../files', room.cover.url);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      // Remove cover reference
      room.cover = undefined;
      await room.save();

      res.status(200).json({
        success: true,
        message: 'Cover image deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to delete cover image'
      });
    }
  }

  // Soft delete room
  async deleteRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Only creator or admin can delete room
      if (!room.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only room creator or admin can delete room'
        });
      }

      // Soft delete the room
      await room.softDelete();

      // Remove room from users' joined rooms
      await User.updateMany(
        { roomsJoined: room._id },
        { $pull: { roomsJoined: room._id } }
      );

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to delete room'
      });
    }
  }

  // Get all rooms (with pagination and filtering)
  async getAllRooms(req, res) {
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

      res.status(200).json({
        success: true,
        data: {
          rooms,
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        },
        message: 'Rooms retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve rooms'
      });
    }
  }

  // Join room or request to join
  async joinRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      const userId = req.user._id;

      // Check if already a member or admin
      if (room.isMember(userId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Already member',
          message: 'Already a member of this room'
        });
      }

      // Public room - join directly
      if (room.roomType === 'public') {
        await room.addMember(userId);
        
        // Add room to user's joined rooms
        await User.findByIdAndUpdate(userId, {
          $addToSet: { roomsJoined: room._id }
        });

        return res.status(200).json({
          success: true,
          message: 'Joined room successfully'
        });
      }

      // Private room - send join request
      if (!room.joinRequests.includes(userId)) {
        room.joinRequests.push(userId);
        await room.save();
      }

      res.status(200).json({
        success: true,
        message: 'Join request sent to room admins'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to join room'
      });
    }
  }

  // Leave room
  async leaveRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      const userId = req.user._id;

      // Can't leave if not a member
      if (!room.isMember(userId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Not member',
          message: 'Not a member of this room'
        });
      }

      // Can't leave if you're the creator
      if (room.createdBy.equals(userId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Creator restriction',
          message: 'Room creator cannot leave the room'
        });
      }

      // Remove from room
      await room.removeUser(userId);

      // Remove room from user's joined rooms
      await User.findByIdAndUpdate(userId, {
        $pull: { roomsJoined: room._id }
      });

      res.status(200).json({
        success: true,
        message: 'Left room successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to leave room'
      });
    }
  }

  // Handle join request (approve/reject)
  async handleJoinRequest(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      const { userId, action } = req.body;

      // Only admins can handle join requests
      if (!room.isAdmin(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only room admins can handle join requests'
        });
      }

      await room.handleJoinRequest(userId, action);

      if (action === 'approve') {
        // Add room to user's joined rooms
        await User.findByIdAndUpdate(userId, {
          $addToSet: { roomsJoined: room._id }
        });
      }

      res.status(200).json({
        success: true,
        message: `Join request ${action}d successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to process join request'
      });
    }
  }

  // Add/remove admin
  async manageAdmin(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      const { userId, action } = req.body;

      // Only creator can manage admins
      if (!room.createdBy.equals(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only room creator can manage admins'
        });
      }

      // Can't manage yourself
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ 
          success: false,
          error: 'Self modification',
          message: 'Cannot change your own admin status'
        });
      }

      if (action === 'add') {
        await room.addMember(userId, true); // Add as admin
      } else if (action === 'remove') {
        // Can't remove if not an admin
        if (!room.isAdmin(userId)) {
          return res.status(400).json({ 
            success: false,
            error: 'Not admin',
            message: 'User is not an admin'
          });
        }
        await room.removeUser(userId);
      } else {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid action',
          message: 'Action must be either "add" or "remove"'
        });
      }

      res.status(200).json({
        success: true,
        message: `Admin ${action === 'add' ? 'added' : 'removed'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to manage admin'
      });
    }
  }

  // Get room members
  async getMembers(req, res) {
    try {
      const room = await Room.findById(req.params.id)
        .populate('admins', 'username profilePic lastActive')
        .populate('members', 'username profilePic lastActive');

      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Only members can see members list for private rooms
      if (room.roomType === 'private' && !room.isMember(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Access denied to members list'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          admins: room.admins,
          members: room.members
        },
        message: 'Members retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve members'
      });
    }
  }

  // Get room join requests
  async getJoinRequests(req, res) {
    try {
      const room = await Room.findById(req.params.id)
        .populate('joinRequests', 'username profilePic createdAt');

      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      // Only admins can see join requests
      if (!room.isAdmin(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only admins can view join requests'
        });
      }

      res.status(200).json({
        success: true,
        data: room.joinRequests,
        message: 'Join requests retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve join requests'
      });
    }
  }

  // Pin/unpin post in room
  async togglePinPost(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room || room.isDeleted) {
        return res.status(404).json({ 
          success: false,
          error: 'Not found',
          message: 'Room not found'
        });
      }

      const { postId } = req.body;

      // Only admins can pin posts
      if (!room.isAdmin(req.user._id)) {
        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Only admins can pin posts'
        });
      }

      // Verify post belongs to this room
      const post = await Post.findById(postId);
      if (!post || !post.roomId.equals(room._id)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid post',
          message: 'Post does not belong to this room'
        });
      }

      await room.togglePinPost(postId);

      // Update post's pinned status
      post.isPinned = room.pinnedPosts.includes(postId);
      await post.save();

      res.status(200).json({ 
        success: true,
        data: {
          isPinned: post.isPinned
        },
        message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to toggle post pin status'
      });
    }
  }
}

module.exports = new RoomController();
const mongoose = require('mongoose');
const { createUploader, deleteFile, getRelativePath } = require('../utils/fileUploadUtils');
const getImageURL = require("../utils/getImageURL");
const bcrypt = require('bcryptjs');
class UserController {
  constructor() {
    this.User = mongoose.model('User');
    this.uploadProfilePic = createUploader({
      subfolder: 'users',
      idSubFolder: 'profile',
      fieldName: 'profilePic',
      fileType: 'image',
      maxSize: 5 * 1024 * 1024 // 5MB for profile pics
    });
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.editProfile = this.editProfile.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.createUser = this.createUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.followUser = this.followUser.bind(this);
    this.unfollowUser = this.unfollowUser.bind(this);
    this._sendResponse = this._sendResponse.bind(this);
  }

  // Helper method for consistent responses
  _sendResponse(res, status, success, message, data = null, error = null,user=null) {
    const response = { success, message };
    if (data) response.data = data;
    if (error) response.error = error;
    if (user) response.user=user;
    return res.status(status).json(response);
  }

async createUser(req, res) {
    try {
      const { 
        firstname, 
        lastname, 
        username, 
        email, 
        phone, 
        password,
        role,
        isBanned,
        bio,
        socialLinks
      } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return this._sendResponse(res, 400, false, 'Username, email and password are required');
      }

      // Check for existing user
      const existingUser = await this.User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return this._sendResponse(res, 400, false, 'Username or email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = new this.User({
        firstname,
        lastname,
        username,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'user',
        isBanned: isBanned || false,
        bio: bio || null,
        socialLinks: socialLinks ? {
          twitter: socialLinks.twitter || null,
          facebook: socialLinks.facebook || null,
          instagram: socialLinks.instagram || null,
          linkedin: socialLinks.linkedin || null,
          website: socialLinks.website || null
        } : null
      });

      const savedUser = await newUser.save();
      
      // Return user data without password
      const userResponse = savedUser.toObject();
      delete userResponse.password;
      delete userResponse.__v;

      this._sendResponse(res, 201, true, 'User created successfully', userResponse);
    } catch (error) {
      this._sendResponse(res, 500, false, 'Failed to create user', null, error.message);
    }
  }



  // Get all users (Admin only)
async getAllUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count of documents
    const total = await this.User.countDocuments({ isDeleted: false });

    const users = await this.User.find({ isDeleted: false })
      .select('-password -__v')
      .populate('followers following roomsJoined')
      .skip(skip)
      .limit(limit);

    this._sendResponse(res, 200, true, 'Users retrieved successfully', {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (err) {
    this._sendResponse(res, 500, false, 'Server error', null, err.message);
  }
}

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const user = await this.User.findById(req.user._id)
        .select('-password -__v')
        .populate('followers following');
      
      if (!user) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      // Format profile picture URL
      user.profilePic = getImageURL(user.profilePic);
      this._sendResponse(res, 200, true, 'User profile retrieved', user);
    } catch (err) {
      this._sendResponse(res, 500, false, 'Server error', null, err.message);
    }
  }

  // Get user by ID (Admin or self)
  async getUserById(req, res) {
    try {
      const user = await this.User.findById(req.params.id)
        .select('-password -__v')
        .populate('followers following roomsJoined');
      
      if (!user || user.isDeleted) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      this._sendResponse(res, 200, true, 'User retrieved successfully', user);
    } catch (err) {
      this._sendResponse(res, 500, false, 'Server error', null, err.message);
    }
  }

  // Edit user profile
  async editProfile(req, res) {
    try {
      this.uploadProfilePic(req, res, async (err) => {
        if (err) {
          return this._sendResponse(res, 400, false, err.message);
        }

        const userId = req.user._id;
        const { 
          firstname, 
          lastname, 
          username, 
          email, 
          phone, 
          bio,
          socialLinks
        } = req.body;

        // Find user
        const user = await this.User.findById(userId);
        if (!user) {
          return this._sendResponse(res, 404, false, 'User not found');
        }

        // Update basic fields
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.username = username || user.username;
        user.email = email || user.email;
        user.phone = phone || null;
        user.bio = bio || null;
        user.lastActive = Date.now();

        // Handle social links
        if (socialLinks) {
          try {
            const parsedLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
            user.socialLinks = {
              twitter: parsedLinks.twitter || null,
              facebook: parsedLinks.facebook || null,
              instagram: parsedLinks.instagram || null,
              linkedin: parsedLinks.linkedin || null,
              website: parsedLinks.website || null
            };
          } catch (e) {
            console.error('Error parsing social links:', e);
          }
        }

        // Handle profile picture upload
        if (req.file) {
          // Delete old profile picture if exists
          if (user.profilePic) {
            deleteFile(user.profilePic);
          }
          user.profilePic = getRelativePath(req.file.path);
        }

        // Save updated user
        const updatedUser = await user.save();
        updatedUser.password = undefined; // Remove password from response
        updatedUser.__v = undefined;

        this._sendResponse(res, 200, true, 'Profile updated successfully', updatedUser,null,updatedUser);
      });
    } catch (error) {
      this._sendResponse(res, 500, false, 'Internal server error', null, error.message);
    }
  }

  // Update user (Admin only)
async updateUser(req, res) {
    try {
      const user = await this.User.findById(req.params.id);
      if (!user || user.isDeleted) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      const {
        firstname,
        lastname,
        username,
        email,
        phone,
        password, // Optional password update
        role,
        isBanned,
        bio,
        socialLinks
      } = req.body;

      // Update basic fields
      if (firstname !== undefined) user.firstname = firstname;
      if (lastname !== undefined) user.lastname = lastname;
      if (username !== undefined) user.username = username;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      if (isBanned !== undefined) user.isBanned = isBanned;
      if (bio !== undefined) user.bio = bio;

      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      // Update social links
      if (socialLinks) {
        user.socialLinks = {
          twitter: socialLinks.twitter || null,
          facebook: socialLinks.facebook || null,
          instagram: socialLinks.instagram || null,
          linkedin: socialLinks.linkedin || null,
          website: socialLinks.website || null
        };
      }

      user.lastActive = Date.now();
      const updatedUser = await user.save();

      // Return updated user without sensitive data
      const userResponse = updatedUser.toObject();
      delete userResponse.password;
      delete userResponse.__v;

      this._sendResponse(res, 200, true, 'User updated successfully', userResponse);
    } catch (error) {
      if (error.code === 11000) {
        this._sendResponse(res, 400, false, 'Username or email already exists');
      } else {
        this._sendResponse(res, 500, false, 'Failed to update user', null, error.message);
      }
    }
  }


  // Delete user (soft delete)
  async deleteUser(req, res) {
    try {
      const user = await this.User.findById(req.params.id);
      if (!user || user.isDeleted) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      user.isDeleted = true;
      user.deletedAt = Date.now();
      await user.save();

      this._sendResponse(res, 200, true, 'User deleted successfully');
    } catch (err) {
      this._sendResponse(res, 500, false, 'Server error', null, err.message);
    }
  }

  // Follow a user
  async followUser(req, res) {
    try {
      const userToFollow = await this.User.findById(req.params.id);
      const currentUser = await this.User.findById(req.user._id);
      
      if (!userToFollow || !currentUser || userToFollow.isDeleted) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      // Check if already following
      if (currentUser.following.includes(userToFollow._id)) {
        return this._sendResponse(res, 400, false, 'Already following this user');
      }

      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();

      this._sendResponse(res, 200, true, 'User followed successfully');
    } catch (err) {
      this._sendResponse(res, 500, false, 'Server error', null, err.message);
    }
  }

  // Unfollow a user
  async unfollowUser(req, res) {
    try {
      const userToUnfollow = await this.User.findById(req.params.id);
      const currentUser = await this.User.findById(req.user._id);
      
      if (!userToUnfollow || !currentUser || userToUnfollow.isDeleted) {
        return this._sendResponse(res, 404, false, 'User not found');
      }

      // Check if actually following
      if (!currentUser.following.includes(userToUnfollow._id)) {
        return this._sendResponse(res, 400, false, 'Not following this user');
      }

      currentUser.following = currentUser.following.filter(id => !id.equals(userToUnfollow._id));
      userToUnfollow.followers = userToUnfollow.followers.filter(id => !id.equals(currentUser._id));

      await currentUser.save();
      await userToUnfollow.save();

      this._sendResponse(res, 200, true, 'User unfollowed successfully');
    } catch (err) {
      this._sendResponse(res, 500, false, 'Server error', null, err.message);
    }
  }
}

module.exports = new UserController();
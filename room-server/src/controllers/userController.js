const path = require('path');
const { createUploader, deleteFile, getRelativePath } = require('../utils/fileUploadUtils');
const User = require('../models/User');
const getImageURL=require("../utils/getImageURL");
// Create profile picture upload middleware
const uploadProfilePic = createUploader({
  subfolder: 'users',
  fieldName: 'profilePic',
  fileType: 'image',
  maxSize: 5 * 1024 * 1024 // 5MB for profile pics
});

const editProfile = async (req, res) => {
  try {
    // Handle file upload
    uploadProfilePic(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ 
          success: false,
          message: err.message 
        });
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

      // Parse socialLinks if needed
      let parsedSocialLinks = {};
      try {
        parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks || {};
      } catch (e) {
        parsedSocialLinks = {};
      }

      // Prepare update data
      const updateData = {
        firstname,
        lastname,
        username,
        email,
        phone: phone || null,
        bio: bio || null,
        socialLinks: {
          twitter: parsedSocialLinks.twitter || null,
          facebook: parsedSocialLinks.facebook || null,
          instagram: parsedSocialLinks.instagram || null,
          linkedin: parsedSocialLinks.linkedin || null,
          website: parsedSocialLinks.website || null
        }
      };

      // If file was uploaded, handle it
      if (req.file) {
        // Get relative path for DB storage
        updateData.profilePic = getRelativePath(req.file.path);
        
        // Delete old profile picture if exists
        const user = await User.findById(userId);
        if (user.profilePic) {
          deleteFile(user.profilePic);
        }
      }

      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (!updatedUser) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('followers following roomsJoined');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error At User', error: err.message });
    }
  };
  const updateUser = async (req, res) => {
    const { firstname, lastname, username, bio, profilePic } = req.body;
    
    try {
      // console.log("incoming");
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        firstname, lastname, username, bio, profilePic, lastActive: Date.now()
      }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error Check', error: err.message });
    }
  };

  const deleteUser = async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndUpdate(req.params.id, {
        isDeleted: true, deletedAt: Date.now()
      }, { new: true });
  
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };

  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().populate('followers following roomsJoined');
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };

  const followUser = async (req, res) => {
    try {
      const userToFollow = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id); // Assuming user ID is in the token
      
      if (!userToFollow || !currentUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
  
      await currentUser.save();
      await userToFollow.save();
  
      res.status(200).json({ success: true, message: 'User followed successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };
  const unfollowUser = async (req, res) => {
    try {
      const userToUnfollow = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id); // Assuming user ID is in the token
      
      if (!userToUnfollow || !currentUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());
  
      await currentUser.save();
      await userToUnfollow.save();
  
      res.status(200).json({ success: true, message: 'User unfollowed successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };
    
  const getCurrentUser = async (req, res) => {
    try {
      // Use the current user's ID from the JWT token (req.user._id)
      // console.log("In User:",req.user);
      const currentUser = await User.findById(req.user._id).populate('followers following');
      currentUser.profilePic=getImageURL(currentUser.profilePic);
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      // console.log(currentUser);
      res.status(200).json({ success: true, data: currentUser });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error in Curr', error: err.message });
    }
  };
  
  module.exports={
      getUserById,
      updateUser,
      deleteUser,
      getAllUsers,
      followUser,
      unfollowUser,
      getCurrentUser,
      editProfile
  };
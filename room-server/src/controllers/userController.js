const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user._id; // Assuming you have user in req from auth middleware
    const userDir = path.join(__dirname, '../files/users', userId.toString(), 'profile');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.'), false);
  }
};

// Initialize Multer with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB limit
  }
}).single('profilePic');

// Edit user profile controller
const editProfile = async (req, res) => {
  try {
    // Handle file upload first

    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
          success: false,
          message: err.message 
        });
      } else if (err) {
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

      // Parse socialLinks if it's a string (from form-data)
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

      // If file was uploaded, add profilePic to update data
      if (req.file) {
        // Construct relative path to store in DB
        const relativePath = path.join('users', userId.toString(), 'profile', req.file.filename);
        updateData.profilePic = relativePath;
        
        // If user had previous profile picture, delete it
        const user = await User.findById(userId);
        if (user.profilePic) {
          const oldPath = path.join(__dirname, '../files', user.profilePic);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
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
      console.log("incoming");
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
      
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      console.log(currentUser);
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
const User = require('../models/User');

const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id).populate('followers following roomsJoined');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  };
  const updateUser = async (req, res) => {
    const { firstname, lastname, username, bio, profilePic } = req.body;
    
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        firstname, lastname, username, bio, profilePic, lastActive: Date.now()
      }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
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
      const currentUser = await User.findById(req.user.id); // Assuming user ID is in the token
      
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
      const currentUser = await User.findById(req.user.id); // Assuming user ID is in the token
      
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
      // Use the current user's ID from the JWT token (req.user.id)
      // console.log("In User:",req.user);
      const currentUser = await User.findById(req.user.id).populate('followers following');
      
      if (!currentUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
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
      getCurrentUser
  };
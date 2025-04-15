const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: { type: String,unique:true,required:true,length: { min: 3, max: 20 }, match: /^[a-z]/ },
  email: { type: String, unique: true, required: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true },
  phone: {
    type: String,
    default:null
  },

  verifications: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
  },

  role: { type: String, enum: ["roomOwner", "roomMember", "admin", "general"], default: "general" },
  profilePic: String,
  bio: String,

  lastActive: { type: Date, default: Date.now },
  lastLogin: Date,
  failedLoginAttempts: { type: Number, default: 0 },

  roomsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  postsCount: { type: Number, default: 0 },

  isBanned: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const roomSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    cover: {
      url: String,
      publicId: String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    roomType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    visibility: {
      type: Boolean,
      default: true
    },
    joinRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    tags: [{
      type: String,
      trim: true
    }],
    pinnedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }],
    postsCount: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalReports: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  // Indexes for better query performance
  roomSchema.index({ name: 'text', description: 'text', tags: 'text' });
  roomSchema.index({ engagementScore: -1 });
  roomSchema.index({ createdBy: 1 });
  
  // Virtual for posts relationship
  roomSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'roomId'
  });
  
  // Middleware to update engagement score
  roomSchema.pre('save', function(next) {
    this.engagementScore = this.postsCount * 2 + this.totalLikes * 1 + this.totalComments * 3;
    next();
  });
  
  module.exports = mongoose.model('Room', roomSchema);
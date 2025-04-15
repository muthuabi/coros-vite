const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  accepts: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  up: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  down: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  reports: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search functionality
commentSchema.index({ content: 'text' });

module.exports = mongoose.model('Comment', commentSchema);
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const PostSchema = new mongoose.Schema({
  // Core Post Fields (unchanged)
  roomId: {
    type: ObjectId,
    ref: 'Room',
    index: true,
    required: function() {
      return this.scope === 'room' && this.type=='question';
    }
  },
  authorId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true
  },
  
  // Content Fields (unchanged)
  content: {
    type: String,
    required: function() {
      return this.type !== 'poll' && this.type !== 'question';
    }
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'poll', 'question', 'answer'],
    required: true,
    default: 'text'
  },
  scope: {
    type: String,
    enum: ['room', 'personal', 'global'],
    default: 'room'
  },
  
  // Media Handling (unchanged)
  media: [{
    url: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'other'],
      required: true
    },
    filename: String,
    size: Number,
    width: Number,
    height: Number,
    thumbnail: String
  }],
  
  // Enhanced Q&A Specific Fields
  questionDetails: {
    title: String,
    body: String,
    tags: [String],
    acceptedAnswerId: {
      type: ObjectId,
      ref: 'Post'
    },
    bounty: { // Optional for Q&A systems with bounties
      amount: Number,
      expiresAt: Date,
      awarded: Boolean
    }
  },
  
  // Enhanced Poll Specific Fields
  pollOptions: [{
    text: String,
    votes: [{
      userId: ObjectId,
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  // Enhanced Voting System
  votes: {
    upvotes: [{
      userId: ObjectId,
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      userId: ObjectId,
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Computed score (upvotes - downvotes)
    score: {
      type: Number,
      default: 0
    }
  },
  
  // Q&A Answer Status
  isAccepted: {
    type: Boolean,
    default: false
  },
  
  // Engagement Fields (enhanced)
 likes: [{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
}],
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  viewHistory: [{
    userId: ObjectId,
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata (unchanged)
  tags: [String],
  parentPostId: {
    type: ObjectId,
    ref: 'Post'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isDeleted:{
    type: Boolean,
    default:false,
    deletedAt:{
      type:Date,
      default:Date.now
    }
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance (enhanced)
PostSchema.index({ roomId: 1, createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ type: 1, scope: 1 });
PostSchema.index({ 'questionDetails.tags': 1 });
PostSchema.index({ parentPostId: 1 });
PostSchema.index({ 'votes.score': -1 }); // For sorting by popularity
PostSchema.index({ 'questionDetails.acceptedAnswerId': 1 });

// Virtuals (enhanced)
PostSchema.virtual('upvoteCount').get(function() {
  return this.votes.upvotes.length;
});

PostSchema.virtual('downvoteCount').get(function() {
  return this.votes.downvotes.length;
});

PostSchema.virtual('engagementScore').get(function() {
  const votesWeight = this.votes.score * 2;
  const likesWeight = this.likes.length * 1.5;
  const commentsWeight = this.commentsCount * 3;
  const viewsWeight = this.views * 0.1;
  const acceptedBonus = this.isAccepted ? 50 : 0; // Bonus for accepted answers
  return votesWeight + likesWeight + commentsWeight + viewsWeight + acceptedBonus;
});

// Pre-save hook to calculate vote score
PostSchema.pre('save', function(next) {
  this.votes.score = this.votes.upvotes.length - this.votes.downvotes.length;
  this.updatedAt = Date.now();
  next();
});

// Static method for vote handling
PostSchema.statics.vote = async function(postId, userId, voteType) {
  const post = await this.findById(postId);
  
  if (!post) {
    throw new Error('Post not found');
  }

  // Remove existing votes from this user
  post.votes.upvotes = post.votes.upvotes.filter(
    vote => !vote.userId.equals(userId)
  );
  post.votes.downvotes = post.votes.downvotes.filter(
    vote => !vote.userId.equals(userId)
  );

  // Add new vote if specified
  if (voteType === 'upvote') {
    post.votes.upvotes.push({ userId });
  } else if (voteType === 'downvote') {
    post.votes.downvotes.push({ userId });
  }

  // Recalculate score
  post.votes.score = post.votes.upvotes.length - post.votes.downvotes.length;
  
  return post.save();
};

// Static method for accepting answers
PostSchema.statics.acceptAnswer = async function(questionId, answerId, userId) {
  const question = await this.findById(questionId);
  const answer = await this.findById(answerId);

  if (!question || !answer) {
    throw new Error('Question or answer not found');
  }

  // Verify the user is the question author
  if (!question.authorId.equals(userId)) {
    throw new Error('Only the question author can accept answers');
  }

  // Verify this is actually an answer to the question
  if (!answer.parentPostId.equals(questionId)) {
    throw new Error('This post is not an answer to the question');
  }

  // Unaccept any previously accepted answer
  if (question.questionDetails.acceptedAnswerId) {
    const prevAccepted = await this.findById(question.questionDetails.acceptedAnswerId);
    if (prevAccepted) {
      prevAccepted.isAccepted = false;
      await prevAccepted.save();
    }
  }

  // Accept the new answer
  question.questionDetails.acceptedAnswerId = answerId;
  answer.isAccepted = true;

  await Promise.all([question.save(), answer.save()]);
  return answer;
};

module.exports = mongoose.model('Post', PostSchema);
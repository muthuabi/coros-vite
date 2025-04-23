const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [3, 'Room name must be at least 3 characters long'],
        maxlength: [50, 'Room name cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9 ]+$/.test(v);
            },
            message: props => `${props.value} contains invalid characters. Only alphanumeric characters and spaces are allowed.`
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    cover: {
        url: String,
        publicId: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true // Can't be changed after creation
    },
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function(v) {
                return !this.members.includes(v) || 'User is already a member';
            }
        }
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function(v) {
                return !this.admins.includes(v) || 'User is already an admin';
            }
        }
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
        ref: 'User',
        validate: {
            validator: function(v) {
                return !this.members.includes(v) && !this.admins.includes(v) || 
                       'User is already a member or admin';
            }
        }
    }],
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Tags cannot exceed 20 characters each'],
        validate: {
            validator: function(v) {
                return v.length <= 20;
            },
            message: 'Each tag must be 20 characters or less'
        }
    }],
    pinnedPosts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        validate: {
            validator: async function(v) {
                const post = await mongoose.model('Post').findById(v);
                return post && post.roomId.equals(this._id);
            },
            message: 'Pinned post must belong to this room'
        }
    }],
    postsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalLikes: {
        type: Number,
        default: 0,
        min: 0
    },
    totalComments: {
        type: Number,
        default: 0,
        min: 0
    },
    totalReports: {
        type: Number,
        default: 0,
        min: 0
    },
    engagementScore: {
        type: Number,
        default: 0,
        min: 0
    },
    // Additional fields for better integration
    lastActivity: {
        type: Date,
        default: Date.now
    },
    memberCount: {
        type: Number,
        default: 1, // Starts with creator
        min: 1
    },
    settings: {
        postApprovalRequired: {
            type: Boolean,
            default: false
        },
        memberInviteOnly: {
            type: Boolean,
            default: false
        },
        allowFileUploads: {
            type: Boolean,
            default: true
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
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
roomSchema.index({ lastActivity: -1 });
roomSchema.index({ memberCount: -1 });

// Virtual for posts relationship
roomSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'roomId'
});

// Virtual for active members (admins + members)
roomSchema.virtual('activeMembers').get(function() {
    return [...new Set([...this.admins, ...this.members])];
});

// Middleware to update engagement score and last activity
roomSchema.pre('save', function(next) {
    this.engagementScore = this.postsCount * 2 + this.totalLikes * 1 + this.totalComments * 3;
    this.memberCount = this.activeMembers.length;
    
    // Update last activity if engagement-related fields change
    if (this.isModified('postsCount') || this.isModified('totalLikes') || 
       this.isModified('totalComments') || this.isModified('totalReports')) {
        this.lastActivity = Date.now();
    }
    next();
});

// Static method to create a new room with creator as admin
roomSchema.statics.createRoom = async function(roomData, creatorId) {
    const room = new this({
        ...roomData,
        createdBy: creatorId,
        admins: [creatorId],
        members: [creatorId]
    });
    
    await room.save();
    return room;
};

// Method to add a member to the room
roomSchema.methods.addMember = async function(userId, isAdmin = false) {
    // Remove from join requests if present
    this.joinRequests = this.joinRequests.filter(id => !id.equals(userId));
    
    // Add to appropriate array
    if (isAdmin) {
        if (!this.admins.some(id => id.equals(userId))) {
            this.admins.push(userId);
        }
    } else {
        if (!this.members.some(id => id.equals(userId))) {
            this.members.push(userId);
        }
    }
    
    // Ensure user isn't in both arrays
    if (isAdmin) {
        this.members = this.members.filter(id => !id.equals(userId));
    }
    
    await this.save();
    return this;
};

// Method to remove a user from the room
roomSchema.methods.removeUser = async function(userId) {
    // Can't remove the creator
    if (this.createdBy.equals(userId)) {
        throw new Error('Cannot remove room creator');
    }
    
    this.admins = this.admins.filter(id => !id.equals(userId));
    this.members = this.members.filter(id => !id.equals(userId));
    this.joinRequests = this.joinRequests.filter(id => !id.equals(userId));
    
    await this.save();
    return this;
};

// Method to handle join requests
roomSchema.methods.handleJoinRequest = async function(userId, action) {
    const requestIndex = this.joinRequests.findIndex(id => id.equals(userId));
    
    if (requestIndex === -1) {
        throw new Error('No join request found for this user');
    }
    
    // Remove from requests
    this.joinRequests.splice(requestIndex, 1);
    
    // Handle the action
    if (action === 'approve') {
        this.members.push(userId);
    }
    
    await this.save();
    return this;
};

// Method to check if a user has permission to post
roomSchema.methods.canPost = function(userId) {
    if (this.roomType === 'public') return true;
    return this.admins.some(id => id.equals(userId)) || 
           this.members.some(id => id.equals(userId));
};

// Method to check if a user is an admin
roomSchema.methods.isAdmin = function(userId) {
    return this.admins.some(id => id.equals(userId));
};

// Method to check if a user is a member (or admin)
roomSchema.methods.isMember = function(userId) {
    return this.admins.some(id => id.equals(userId)) || 
           this.members.some(id => id.equals(userId));
};

// Method to update room stats when a post is created/deleted
roomSchema.methods.updatePostStats = async function(change) {
    this.postsCount += change;
    this.lastActivity = Date.now();
    await this.save();
};

// Method to update engagement stats
roomSchema.methods.updateEngagementStats = async function({ likes = 0, comments = 0, reports = 0 }) {
    this.totalLikes += likes;
    this.totalComments += comments;
    this.totalReports += reports;
    this.lastActivity = Date.now();
    await this.save();
};

// Method to pin/unpin a post
roomSchema.methods.togglePinPost = async function(postId) {
    const index = this.pinnedPosts.findIndex(id => id.equals(postId));
    
    if (index === -1) {
        // Pin the post (limit to 5 pinned posts)
        if (this.pinnedPosts.length >= 5) {
            throw new Error('Maximum of 5 pinned posts allowed');
        }
        this.pinnedPosts.push(postId);
    } else {
        // Unpin the post
        this.pinnedPosts.splice(index, 1);
    }
    
    await this.save();
    return this;
};

// Method to soft delete the room
roomSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.visibility = false;
    await this.save();
    return this;
};

module.exports = mongoose.model('Room', roomSchema);
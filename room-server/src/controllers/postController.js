const Post = require('../models/Post');
const fileUploadUtil = require('../utils/fileUploadUtils');
const path = require('path');
const getImageURL = require("../utils/getImageURL");

class PostController {
  // Create a new post
  async createPost(req, res) {
    try {
      const { content, type, scope, roomId, questionDetails, pollOptions, tags } = req.body;
      const file = req.file; // Changed from req.files to req.file since we're using single()

      // Validate post type
      if (!['text', 'image', 'video', 'file', 'poll', 'question', 'answer'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid post type' });
      }

      // Create base post
      const post = new Post({
        authorId: req.user._id,
        authorName: req.user.username,
        content,
        type,
        scope,
        roomId: scope === 'room' ? roomId : null,
        tags: tags || [],
        questionDetails: type === 'question' ? {
          title: questionDetails?.title || '',
          body: questionDetails?.body || '',
          tags: questionDetails?.tags || []
        } : null,
        pollOptions: type === 'poll' ? 
          (pollOptions || []).map(opt => ({ text: opt, votes: [] })) : 
          null
      });

      // Process and upload file if exists
      if (file) {
        let fileType;
        if (fileUploadUtil.supportedFileTypes.image.includes(file.mimetype)) fileType = 'image';
        else if (fileUploadUtil.supportedFileTypes.video.includes(file.mimetype)) fileType = 'video';
        else if (fileUploadUtil.supportedFileTypes.document.includes(file.mimetype)) fileType = 'document';
        else fileType = 'other';
        const relativePath = fileUploadUtil.getRelativePath(file.path);
        post.media = [{
          url: getImageURL(relativePath),
          path: relativePath,
          type: fileType,
          filename: file.originalname,
          size: file.size
        }];
      }

      await post.save();
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update a post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { content, type, scope, roomId, questionDetails, pollOptions, tags } = req.body;
      const file = req.file; // Changed from req.files to req.file

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Check permissions
      if (!post.authorId.equals(req.user._id) && !req.user.isAdmin) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this post' });
      }

      // Update post fields
      post.content = content || post.content;
      post.type = type || post.type;
      post.scope = scope || post.scope;
      post.roomId = scope === 'room' ? roomId : null;
      post.tags = tags || post.tags;
      post.isEdited = true;

      if (type === 'question') {
        post.questionDetails = {
          title: questionDetails?.title || post.questionDetails?.title || '',
          body: questionDetails?.body || post.questionDetails?.body || '',
          tags: questionDetails?.tags || post.questionDetails?.tags || []
        };
      }

      if (type === 'poll') {
        post.pollOptions = (pollOptions || []).map(opt => ({ text: opt, votes: [] }));
      }

      // Process and upload new file if exists
      if (file) {
        // Delete old media files if they exist
        if (post.media && post.media.length > 0) {
          post.media.forEach(media => {
            try {
              fileUploadUtil.deleteFile(media.path);
            } catch (err) {
              console.error(`Error deleting file ${media.path}:`, err);
            }
          });
        }

        let fileType;
        if (fileUploadUtil.supportedFileTypes.image.includes(file.mimetype)) fileType = 'image';
        else if (fileUploadUtil.supportedFileTypes.video.includes(file.mimetype)) fileType = 'video';
        else if (fileUploadUtil.supportedFileTypes.document.includes(file.mimetype)) fileType = 'document';
        else fileType = 'other';

        const relativePath = fileUploadUtil.getRelativePath(file.path);
        post.media = [{
          url: getImageURL(relativePath),
          path: relativePath,
          type: fileType,
          filename: file.originalname,
          size: file.size
        }];
      }

      await post.save();
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }

      // Check permissions
      if (!post.authorId.equals(req.user._id)) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
      }

      // Delete associated files
      // if (post.media && post.media.length > 0) {
      //   post.media.forEach(file => {
      //     try {
      //       fileUploadUtil.deleteFile(file.path);
      //     } catch (err) {
      //       console.error(`Error deleting file ${file.path}:`, err);
      //     }
      //   });
      // }
      post.isDeleted=true;
      await post.save();
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // View a single post
  async viewPost(req, res) {
    try {
      const post = await Post.findOne({_id:req.params.id,isDeleted:{$ne:true}})
        .populate('authorId', 'username profilePic')
        .populate('parentPostId', 'content authorName')
        .populate('questionDetails.acceptedAnswerId');
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Track view (if authenticated)
      if (req.user) {
        post.views += 1;
        post.viewHistory.push({ userId: req.user._id });
        await post.save();
      }
      post.authorId.profilePic=getImageURL(post.authorId.profilePic);
      res.status(201).json({sucess:true,data:post});
    } catch (error) {
      console.error('Error viewing post:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // View multiple posts with filtering
  async viewPosts(req, res) {
    try {
      const { type, scope, roomId, authorId, parentPostId, tag, sortBy = 'newest' } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (type) query.type = type;
      if (scope) query.scope = scope;
      if (roomId) query.roomId = roomId;
      if (authorId) query.authorId = authorId;
      if (parentPostId) query.parentPostId = parentPostId;
      if (tag) query.tags = tag;
      query.isDeleted={$ne:true};
      // Build sort
      let sort = {};
      if (sortBy === 'newest') sort = { createdAt: -1 };
      if (sortBy === 'oldest') sort = { createdAt: 1 };
      if (sortBy === 'popular') sort = { likes: -1 }; // Sort by number of likes
      // if (sortBy === 'popular') sort = { 'votes.score': -1 };

      const posts = await Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('authorId', '_id username profilePic')
        .populate('questionDetails.acceptedAnswerId')
        .lean();

      const total = await Post.countDocuments(query);

      res.status(201).json({
        sucess:true,
        data:posts,
        total,
        page,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error viewing posts:', error);
      res.status(500).json({sucess:false, error: error.message });
    }
  }

// Add these methods to your PostController class

// Like/unlike a post
async likePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(like => 
      like.userId.toString() === userId.toString()
    );

    if (likeIndex === -1) {
      // Add like
      post.likes.push({ userId });
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Track post view
async trackView(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    if (req.user) {
      const lastView = post.viewHistory.find(
        view => view.userId.equals(req.user._id) && 
        new Date() - new Date(view.viewedAt) < 24 * 60 * 60 * 1000
      );
      
      if (!lastView) {
        post.views += 1;
        post.viewHistory.push({
          userId: req.user._id,
          viewedAt: new Date()
        });
        await post.save();
      }
    } else {
      // For anonymous users
      // post.views += 1;
      await post.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
  // Vote on a post
  async votePost(req, res) {
    try {
      const { voteType } = req.body; // 'upvote' or 'downvote'
      
      if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({sucess:false, error: 'Invalid vote type' });
      }

      const post = await Post.vote(req.params.id, req.user._id, voteType);
      res.status(201).json({sucess:true,data:post});
    } catch (error) {
      console.error('Error voting on post:', error);
      res.status(500).json({sucess:false, error: error.message });
    }
  }

  // Accept an answer
  async acceptAnswer(req, res) {
    try {
      const { answerId } = req.body;
      const answer = await Post.acceptAnswer(req.params.id, answerId, req.user._id);
      res.status(201).json({sucess:true,data:answer});
    } catch (error) {
      console.error('Error accepting answer:', error);
      res.status(500).json({ sucess:false,error: error.message });
    }
  }

  // Helper method to process markup content
  async _processMarkupContent(content, postId) {
    // This would:
    // 1. Parse the markup for embedded images/files
    // 2. Upload them to the post's directory
    // 3. Replace with permanent URLs
    // Implementation depends on your markup processor
    return processedContent;
  }



}

module.exports = new PostController();
const Post = require('../models/Post');
const fileUploadUtil = require('../utils/fileUploadUtils');
// const { markdownToHtml } = require('../utils/markdownProcessor'); // Assuming you have this
// const mongoose = require('mongoose');

class PostController {
  // Create a new post
  async createPost(req, res) {
    try {
      const { content, type, scope, roomId, questionDetails, pollOptions, tags } = req.body;
      const files = req.files || [];

      // Validate post type
      if (!['text', 'image', 'video', 'file', 'poll', 'question', 'answer'].includes(type)) {
        return res.status(400).json({sucess:false, error: 'Invalid post type' });
      }

      // Validate parentPostId for answers
      if (type === 'answer' && !req.body.parentPostId) {
        return res.status(400).json({sucess:false, error: 'Answers require a parent post ID' });
      }

      // Create base post
      const post = new Post({
        authorId: req.user._id,
        authorName: req.user.username,
        content,
        type,
        scope,
        roomId: scope === 'room' ? roomId : null,
        parentPostId: req.body.parentPostId || null,
        tags: tags || [],
        questionDetails: type === 'question' ? {
          title: questionDetails.title,
          body: questionDetails.body,
          tags: questionDetails.tags || []
        } : null,
        pollOptions: type === 'poll' ? 
          pollOptions.map(opt => ({ text: opt, votes: [] })) : 
          null
      });

      // Process and upload files
      if (files.length > 0) {
        post.media = await Promise.all(
          files.map(file => {
            let fileType;
            if (fileUploadUtil.supportedFileTypes.image.includes(file.mimetype)) fileType = 'image';
            else if (fileUploadUtil.supportedFileTypes.video.includes(file.mimetype)) fileType = 'video';
            else if (fileUploadUtil.supportedFileTypes.document.includes(file.mimetype)) fileType = 'document';
            else fileType = 'other';

            const relativePath = fileUploadUtil.getRelativePath(file.path);
            
            return {
              url: `/files/${relativePath}`,
              path: relativePath,
              type: fileType,
              filename: file.originalname,
              size: file.size
            };
          })
        );
      }

      // Process Q&A markup content
      if (type === 'question' || type === 'answer') {
        post.content = await this._processMarkupContent(post.content, post._id);
      }

      await post.save();
      res.status(201).json({sucess:true,data:post});
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({sucess:false, error: error.message });
    }
  }

  // Delete a post
  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({sucess:false, error: 'Post not found' });
      }

      // Check permissions
      if (!post.authorId.equals(req.user._id) && !req.user.isAdmin) {
        return res.status(403).json({sucess:false, error: 'Not authorized to delete this post' });
      }

      // Delete associated files
      if (post.media && post.media.length > 0) {
        post.media.forEach(file => {
          fileUploadUtil.deleteFile(file.path);
        });
      }

      // Delete the post
      await post.remove();
      
      res.status(201).json({sucess:true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({sucess:false, error: error.message });
    }
  }

  // View a single post
  async viewPost(req, res) {
    try {
      const post = await Post.findById(req.params.id)
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
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (type) query.type = type;
      if (scope) query.scope = scope;
      if (roomId) query.roomId = roomId;
      if (authorId) query.authorId = authorId;
      if (parentPostId) query.parentPostId = parentPostId;
      if (tag) query.tags = tag;

      // Build sort
      let sort = {};
      if (sortBy === 'newest') sort = { createdAt: -1 };
      if (sortBy === 'oldest') sort = { createdAt: 1 };
      if (sortBy === 'popular') sort = { 'votes.score': -1 };

      const posts = await Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'username profilePic')
        .populate('questionDetails.acceptedAnswerId');

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
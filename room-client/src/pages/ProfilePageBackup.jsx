import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, Dialog, DialogActions, DialogContent, 
  DialogTitle, IconButton, Paper, Tab, Tabs, Typography,
  useMediaQuery, useTheme,styled, CircularProgress, TextField, Chip,
  Avatar, Card, CardHeader, CardContent, CardActions, Divider,
  Menu, MenuItem , ListItemIcon, ListItemText, Stack
} from '@mui/material';
import { 
  Add, Edit, Delete, Close, MoreVert, Check, ArrowUpward,
  ArrowDownward, Bookmark, Comment, Share, Image as ImageIcon,
  VideoLibrary, Poll
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUIState } from '../contexts/UIStateContext';
import MarkupEditor from '../components/posts/MarkupEditor';
import axos from '../axos';

const PostPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, loggedIn } = useAuth();
  const { uiState, closeUIState, openUIState } = useUIState();
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    type: 'text',
    scope: 'room',
    roomId: null,
    tags: [],
    questionDetails: { title: '', body: '' },
    pollOptions: [],
    media: []
  });
  const [tagInput, setTagInput] = useState('');
  const [pollOptionInput, setPollOptionInput] = useState('');
  const [files, setFiles] = useState([]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axos.get('/api/posts');
        // console.log(res);
        setPosts(res.data?.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Handle poll option input
  const handlePollOptionInput = (e) => {
    if (e.key === 'Enter' && pollOptionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        pollOptions: [...prev.pollOptions, { text: pollOptionInput.trim(), votes: [] }]
      }));
      setPollOptionInput('');
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Remove poll option
  const removePollOption = (index) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.filter((_, i) => i !== index)
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
    
    // Create preview URLs
    const filePreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...filePreviews]
    }));
  };

  // Open edit dialog
  const handleEditClick = (post) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      type: post.type,
      scope: post.scope,
      roomId: post.roomId,
      tags: post.tags || [],
      questionDetails: post.questionDetails || { title: '', body: '' },
      pollOptions: post.pollOptions || [],
      media: post.media || []
    });
    openUIState('postModal');
  };

  // Open delete confirmation
  const handleDeleteClick = (post) => {
    setDeleteConfirm(post);
    openUIState('dialog');
  };

  // Close all modals
  const handleClose = () => {
    closeUIState('postModal');
    closeUIState('dialog');
    setEditingPost(null);
    setDeleteConfirm(null);
    setFiles([]);
    setFormData({
      content: '',
      type: 'text',
      scope: 'room',
      roomId: null,
      tags: [],
      questionDetails: { title: '', body: '' },
      pollOptions: [],
      media: []
    });
  };

  // Submit post (create or update)
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('scope', formData.scope);
      formDataToSend.append('content', formData.content);
      
      if (formData.type === 'question') {
        formDataToSend.append('questionDetails[title]', formData.questionDetails.title);
        formDataToSend.append('questionDetails[body]', formData.questionDetails.body);
        formData.tags.forEach(tag => formDataToSend.append('tags[]', tag));
      }
      
      if (formData.type === 'poll') {
        formData.pollOptions.forEach((option, index) => {
          formDataToSend.append(`pollOptions[${index}][text]`, option.text);
        });
      }
      
      files.forEach(file => {
        formDataToSend.append('media', file);
      });

      let res;
      
      if (editingPost) {
        res = await axos.put(`/api/posts/${editingPost._id}`, formDataToSend);
        setPosts(posts.map(p => p._id === editingPost._id ? res.data.data : p));
      } else {
        formDataToSend.append('authorId', user._id);
        formDataToSend.append('authorName', user.username);
        res = await axos.post('/api/posts', formDataToSend);
        setPosts([res.data.data, ...posts]);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axos.delete(`/api/posts/${deleteConfirm._id}`);
      setPosts(posts.filter(p => p._id !== deleteConfirm._id));
      handleClose();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setEditingPost(post);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setEditingPost(null);
  };

  // Handle vote
  const handleVote = async (postId, voteType) => {
    try {
      const res = await axos.post(`/api/posts/${postId}/vote`, { voteType });
      setPosts(posts.map(p => p._id === postId ? res.data.data : p));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Handle poll vote
  const handlePollVote = async (postId, optionIndex) => {
    try {
      const res = await axos.post(`/api/posts/${postId}/vote-poll`, { optionIndex });
      setPosts(posts.map(p => p._id === postId ? res.data.data : p));
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  // Render content based on post type
  const renderPostContent = (post) => {
    switch (post.type) {
      case 'question':
        return (
          <>
            <Typography variant="h6" gutterBottom>
              {post.questionDetails?.title}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {post.questionDetails?.tags?.map(tag => (
                <Chip key={tag} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
            <div dangerouslySetInnerHTML={{ __html: post.questionDetails?.body }} />
          </>
        );
      case 'image':
      case 'video':
        return (
          <>
            <Typography variant="body1" paragraph>
              {post.content}
            </Typography>
            {post.media?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
                {post.media.map((media, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    {post.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt="" 
                        style={{ 
                          maxHeight: 300, 
                          maxWidth: '100%',
                          borderRadius: theme.shape.borderRadius 
                        }} 
                      />
                    ) : (
                      <video 
                        controls
                        style={{ 
                          maxHeight: 300, 
                          maxWidth: '100%',
                          borderRadius: theme.shape.borderRadius 
                        }}
                      >
                        <source src={media.url} type={`video/${media.url.split('.').pop()}`} />
                      </video>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </>
        );
      case 'poll':
        return (
          <>
            <Typography variant="h6" gutterBottom>
              {post.content}
            </Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {post.pollOptions?.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handlePollVote(post._id, index)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {option.text}
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {option.votes?.length || 0} votes
                    </Typography>
                  </Button>
                </Box>
              ))}
            </Stack>
          </>
        );
      default: // text
        return (
          <Typography variant="body1" paragraph>
            {post.content}
          </Typography>
        );
    }
  };

  // Render appropriate input fields based on post type
  const renderInputFields = () => {
    switch (formData.type) {
      case 'question':
        return (
          <>
            <TextField
              label="Question Title"
              name="title"
              value={formData.questionDetails.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                questionDetails: {
                  ...prev.questionDetails,
                  title: e.target.value
                }
              }))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" gutterBottom>
              Question Details
            </Typography>
            <MarkupEditor 
              content={formData.questionDetails.body}
              onChange={(content) => setFormData(prev => ({
                ...prev,
                questionDetails: {
                  ...prev.questionDetails,
                  body: content
                }
              }))}
            />
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Add Tags (press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                fullWidth
              />
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(index)}
                  />
                ))}
              </Box>
            </Box>
          </>
        );
      case 'image':
      case 'video':
        return (
          <>
            <TextField
              label="Description"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
              sx={{ mb: 2 }}
            />
            <input
              accept={formData.type === 'image' ? "image/*" : "video/*"}
              style={{ display: 'none' }}
              id="media-upload"
              type="file"
              onChange={handleFileChange}
              multiple
            />
            <label htmlFor="media-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={formData.type === 'image' ? <ImageIcon /> : <VideoLibrary />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload {formData.type === 'image' ? 'Images' : 'Videos'}
              </Button>
            </label>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2 }}>
              {formData.media.map((media, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  {formData.type === 'image' ? (
                    <img 
                      src={media.preview || media.url} 
                      alt="" 
                      style={{ 
                        height: 100, 
                        width: 'auto',
                        borderRadius: theme.shape.borderRadius 
                      }} 
                    />
                  ) : (
                    <video 
                      style={{ 
                        height: 100, 
                        width: 'auto',
                        borderRadius: theme.shape.borderRadius 
                      }}
                    >
                      <source src={media.preview || media.url} />
                    </video>
                  )}
                  <IconButton
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        media: prev.media.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </>
        );
      case 'poll':
        return (
          <>
            <TextField
              label="Poll Question"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Add Poll Option (press Enter)"
              value={pollOptionInput}
              onChange={(e) => setPollOptionInput(e.target.value)}
              onKeyDown={handlePollOptionInput}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Stack spacing={1} sx={{ mb: 2 }}>
              {formData.pollOptions.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={option.text}
                    onDelete={() => removePollOption(index)}
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        );
      default: // text
        return (
          <TextField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            multiline
            rows={6}
            fullWidth
          />
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {activeTab === 0 ? 'All Posts' : 'My Posts'}
        </Typography>
        {loggedIn && (
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => openUIState('postModal')}
          >
            New Post
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Posts" />
          <Tab label="My Posts" disabled={!loggedIn} />
        </Tabs>
      </Paper>

      {loading && !posts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {(activeTab === 0 ? posts : posts.filter(p => p.authorId._id === user?._id))
          .map(post => (
            <Card key={post._id} elevation={3}>
              <CardHeader
                avatar={<Avatar src={post.authorId.profilePic} alt={post.authorName} />}
                action={
                  (post.authorId._id === user?._id || user?.isAdmin) && (
                    <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                      <MoreVert />
                    </IconButton>
                  )
                }
                title={post.authorName}
                subheader={new Date(post.createdAt).toLocaleString()}
              />
              <CardContent>
                {renderPostContent(post)}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <IconButton onClick={() => handleVote(post._id, 'upvote')}>
                    <ArrowUpward color={post.votes?.upvotes?.includes(user?._id) ? 'primary' : 'inherit'} />
                  </IconButton>
                  <Typography component="span" sx={{ mx: 1 }}>
                    {post.votes?.score || 0}
                  </Typography>
                  <IconButton onClick={() => handleVote(post._id, 'downvote')}>
                    <ArrowDownward color={post.votes?.downvotes?.includes(user?._id) ? 'error' : 'inherit'} />
                  </IconButton>
                </Box>
                <Box>
                  <IconButton>
                    <Comment />
                    <Typography sx={{ ml: 1 }}>{post.commentsCount || 0}</Typography>
                  </IconButton>
                  <IconButton>
                    <Bookmark />
                  </IconButton>
                  <IconButton>
                    <Share />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Post Dialog */}
      <Dialog
        open={uiState.postModal}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              label="Post Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              fullWidth
              sx={{ mb: 2}}
            >
              <MenuItem value="text" >
                {/* <ListItemIcon><Edit fontSize="small" /></ListItemIcon> */}
                <ListItemText>Text</ListItemText>
              </MenuItem>
              <MenuItem value="image">
                {/* <ListItemIcon><ImageIcon fontSize="small" /></ListItemIcon> */}
                <ListItemText>Image</ListItemText>
              </MenuItem>
              <MenuItem value="video">
                {/* <ListItemIcon><VideoLibrary fontSize="small" /></ListItemIcon> */}
                <ListItemText>Video</ListItemText>
              </MenuItem>
              <MenuItem value="question">
                {/* <ListItemIcon><Edit fontSize="small" /></ListItemIcon> */}
                <ListItemText>Question</ListItemText>
              </MenuItem>
              <MenuItem value="poll">
                {/* <ListItemIcon><Poll fontSize="small" /></ListItemIcon> */}
                <ListItemText>Poll</ListItemText>
              </MenuItem>
            </TextField>

            {renderInputFields()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            {editingPost ? 'Update' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={uiState.dialog && !!deleteConfirm}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditClick(editingPost);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteClick(editingPost);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default PostPage;
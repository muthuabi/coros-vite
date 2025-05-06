import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Avatar,
  Tooltip, CircularProgress, Snackbar, Alert, Pagination
} from '@mui/material';
import { Edit, Delete, Visibility, Add, Check, Close } from '@mui/icons-material';
import axos from '../../axos';

const PostControl = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const postTypes = ['text', 'image', 'video', 'file', 'poll', 'question', 'answer'];
  const postScopes = ['public', 'room'];

  useEffect(() => {
    fetchPosts();
  }, [pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axos.get(`api/posts?page=${pagination.page}&limit=${pagination.limit}`);
      setPosts(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSnackbar({ open: true, message: 'Failed to fetch posts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post = null) => {
    setCurrentPost(post || {
      content: '',
      type: 'text',
      scope: 'public',
      roomId: '',
      tags: []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPost(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setCurrentPost(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentPost._id) {
        await axos.put(`api/posts/${currentPost._id}`, currentPost);
        setSnackbar({ open: true, message: 'Post updated successfully', severity: 'success' });
      } else {
        await axos.post('api/posts', currentPost);
        setSnackbar({ open: true, message: 'Post created successfully', severity: 'success' });
      }
      fetchPosts();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axos.delete(`api/posts/${id}`);
      setSnackbar({ open: true, message: 'Post deleted successfully', severity: 'success' });
      fetchPosts();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Delete failed', severity: 'error' });
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Posts Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Post
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Content</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {post.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={post.type} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{post.scope}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {post.tags?.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(post)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(post._id)}>
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.limit)}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Post Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentPost?._id ? 'Edit Post' : 'Create Post'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={currentPost?.content || ''}
              onChange={handleChange}
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Type"
              name="type"
              value={currentPost?.type || 'text'}
              onChange={handleChange}
              margin="normal"
            >
              {postTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Scope"
              name="scope"
              value={currentPost?.scope || 'public'}
              onChange={handleChange}
              margin="normal"
            >
              {postScopes.map((scope) => (
                <MenuItem key={scope} value={scope}>
                  {scope}
                </MenuItem>
              ))}
            </TextField>
            {currentPost?.scope === 'room' && (
              <TextField
                fullWidth
                label="Room ID"
                name="roomId"
                value={currentPost?.roomId || ''}
                onChange={handleChange}
                margin="normal"
              />
            )}
            <TextField
              fullWidth
              label="Tags (comma separated)"
              name="tags"
              value={currentPost?.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {currentPost?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostControl;
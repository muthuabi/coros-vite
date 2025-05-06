import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Avatar,
  Tooltip, CircularProgress, Snackbar, Alert, Pagination, Switch, 
  FormControlLabel, FormHelperText
} from '@mui/material';
import { Edit, Delete, Visibility, Add, Check, Close, Person, AdminPanelSettings } from '@mui/icons-material';
import axos from '../../axos';

const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState({});
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    userId: null,
    userName: ''
  });

  const roles = ['user', 'admin'];

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await axos.get(
      `/api/user?page=${pagination.page}&limit=${pagination.limit}`
    );
    
    setUsers(response.data.data.users);
    setPagination(prev => ({
      ...prev,
      total: response.data.data.pagination.total,
      totalPages: response.data.data.pagination.totalPages
    }));
    
  } catch (err) {
    setError(err.response?.data?.message || err.message);
    setSnackbar({ open: true, message: 'Failed to fetch users', severity: 'error' });
  } finally {
    setLoading(false);
  }
};
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (user = null) => {
    setCurrentUser(user ? { ...user } : {
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      phone: '',
      role: 'user',
      isBanned: false,
      bio: '',
      socialLinks: {
        twitter: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        website: ''
      }
    });
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!currentUser.username) errors.username = 'Username is required';
    if (!currentUser.email) errors.email = 'Email is required';
    if (!currentUser.role) errors.role = 'Role is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (currentUser._id) {
        await axos.put(`/api/user/${currentUser._id}`, currentUser);
        showSnackbar('User updated successfully');
      } else {
        await axos.post('/api/user', currentUser);
        showSnackbar('User created successfully');
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Operation failed';
      showSnackbar(errorMsg, 'error');
      
      // Handle validation errors from server
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm({
      open: true,
      userId: user._id,
      userName: `${user.firstname} ${user.lastname}`
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axos.delete(`/api/user/${deleteConfirm.userId}`);
      showSnackbar('User deleted successfully');
      fetchUsers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleteConfirm({
        open: false,
        userId: null,
        userName: ''
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      open: false,
      userId: null,
      userName: ''
    });
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getStatusColor = (isBanned) => {
    return isBanned ? 'error' : 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add User
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
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.profilePic} sx={{ width: 32, height: 32 }}>
                          {user.username?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography>{user.firstname} {user.lastname}</Typography>
                          <Typography variant="caption">@{user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)}
                        size="small" 
                        icon={user.role === 'admin' ? <AdminPanelSettings fontSize="small" /> : <Person fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isBanned ? 'Banned' : 'Active'} 
                        color={getStatusColor(user.isBanned)} 
                        size="small" 
                        icon={user.isBanned ? <Close fontSize="small" /> : <Check fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleOpenDialog(user)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(user)}>
                          <Edit fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(user)}>
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
  count={pagination.totalPages}
  page={pagination.page}
  onChange={(event, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
  color="primary"
  showFirstButton
  showLastButton
/>
          </Box>
        </>
      )}

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentUser?._id ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstname"
              value={currentUser?.firstname || ''}
              onChange={handleChange}
              margin="normal"
              error={!!validationErrors.firstname}
              helperText={validationErrors.firstname}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastname"
              value={currentUser?.lastname || ''}
              onChange={handleChange}
              margin="normal"
              error={!!validationErrors.lastname}
              helperText={validationErrors.lastname}
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={currentUser?.username || ''}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.username}
              helperText={validationErrors.username}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={currentUser?.email || ''}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={currentUser?.phone || ''}
              onChange={handleChange}
              margin="normal"
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
            />
            <TextField
              select
              fullWidth
              label="Role"
              name="role"
              value={currentUser?.role || 'user'}
              onChange={handleChange}
              margin="normal"
              required
              error={!!validationErrors.role}
              helperText={validationErrors.role}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  name="isBanned"
                  checked={currentUser?.isBanned || false}
                  onChange={handleToggle}
                  color="primary"
                />
              }
              label={currentUser?.isBanned ? 'Banned' : 'Active'}
              labelPlacement="start"
              sx={{ gridColumn: 'span 1' }}
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={3}
              value={currentUser?.bio || ''}
              onChange={handleChange}
              margin="normal"
              sx={{ gridColumn: 'span 2' }}
            />
            <Typography variant="subtitle1" sx={{ gridColumn: 'span 2', mt: 2 }}>
              Social Links
            </Typography>
            <TextField
              fullWidth
              label="Twitter"
              name="twitter"
              value={currentUser?.socialLinks?.twitter || ''}
              onChange={handleSocialLinkChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Facebook"
              name="facebook"
              value={currentUser?.socialLinks?.facebook || ''}
              onChange={handleSocialLinkChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Instagram"
              name="instagram"
              value={currentUser?.socialLinks?.instagram || ''}
              onChange={handleSocialLinkChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="LinkedIn"
              name="linkedin"
              value={currentUser?.socialLinks?.linkedin || ''}
              onChange={handleSocialLinkChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={currentUser?.socialLinks?.website || ''}
              onChange={handleSocialLinkChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {currentUser?._id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteConfirm.userName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserControl;
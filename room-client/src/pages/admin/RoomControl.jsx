import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Avatar,
  Tooltip, CircularProgress, Snackbar, Alert, Pagination, Switch, FormControlLabel
} from '@mui/material';
import { Edit, Delete, Visibility, Add, Check, Close, People, LockOpen, Lock } from '@mui/icons-material';
import axos from '../../axos';

const RoomControl = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const roomTypes = ['public', 'private'];

  useEffect(() => {
    fetchRooms();
  }, [pagination.page]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axos.get(`api/room?page=${pagination.page}&limit=${pagination.limit}`);
      setRooms(response.data.data.rooms);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.total
      }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSnackbar({ open: true, message: 'Failed to fetch rooms', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (room = null) => {
    setCurrentRoom(room || {
      name: '',
      description: '',
      roomType: 'public',
      tags: [],
      visibility: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRoom(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setCurrentRoom(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setCurrentRoom(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async () => {
    try {
      if (currentRoom._id) {
        await axos.put(`api/room/${currentRoom._id}`, currentRoom);
        setSnackbar({ open: true, message: 'Room updated successfully', severity: 'success' });
      } else {
        await axos.post('api/room', currentRoom);
        setSnackbar({ open: true, message: 'Room created successfully', severity: 'success' });
      }
      fetchRooms();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axos.delete(`api/room/${id}`);
      setSnackbar({ open: true, message: 'Room deleted successfully', severity: 'success' });
      fetchRooms();
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
        <Typography variant="h4">Rooms Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Room
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
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Visibility</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {room.roomType === 'private' ? <Lock color="secondary" /> : <LockOpen color="primary" />}
                        {room.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={room.roomType} 
                        color={room.roomType === 'private' ? 'secondary' : 'primary'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography noWrap sx={{ maxWidth: 200 }}>
                        {room.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={room.visibility ? 'Visible' : 'Hidden'} 
                        color={room.visibility ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {room.tags?.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Members">
                        <IconButton>
                          <People fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(room)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(room._id)}>
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

      {/* Room Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{currentRoom?._id ? 'Edit Room' : 'Create Room'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={currentRoom?.name || ''}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={currentRoom?.description || ''}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Room Type"
              name="roomType"
              value={currentRoom?.roomType || 'public'}
              onChange={handleChange}
              margin="normal"
            >
              {roomTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  name="visibility"
                  checked={currentRoom?.visibility || false}
                  onChange={handleToggle}
                  color="primary"
                />
              }
              label="Visible to users"
            />
            <TextField
              fullWidth
              label="Tags (comma separated)"
              name="tags"
              value={currentRoom?.tags?.join(', ') || ''}
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
            {currentRoom?._id ? 'Update' : 'Create'}
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

export default RoomControl;
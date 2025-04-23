// src/pages/RoomPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUIState } from '../contexts/UIStateContext';
import axos from '../axos';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Tooltip,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  MoreVert as MoreVertIcon,
  Pin as PinIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Star as StarIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import RoomPostList from '../components/RoomPostList';
import RoomMemberList from '../components/RoomMemberList';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openUIState } = useUIState();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinRequested, setJoinRequested] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    description: '',
    roomType: 'public',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch room data
  const fetchRoom = async () => {
    try {
      setLoading(true);
      const res = await axos.get(`/api/rooms/${roomId}`);
      setRoom(res.data.data);
      setIsAdmin(res.data.data.admins.some(admin => admin._id === user?._id));
      setIsMember(res.data.data.members.some(member => member._id === user?._id) || isAdmin);
      setJoinRequested(res.data.data.joinRequests.some(req => req._id === user?._id));
      
      // Initialize form with current room data
      if (res.data.data) {
        setRoomForm({
          name: res.data.data.name,
          description: res.data.data.description,
          roomType: res.data.data.roomType,
          tags: res.data.data.tags || []
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch room');
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    } else {
      setLoading(false);
    }
  }, [roomId, user?._id]);

  // Handle room creation
  const handleCreateRoom = () => {
    openUIState('roomDialog');
    setSpeedDialOpen(false);
  };
  const handleJoinRoom = async () => {
      try {
        await axos.post(`/api/rooms/${roomId}/join`);
        await fetchRoom();
      } catch (err) {
        console.error('Error joining room:', err);
      }
    };
  
    const handleLeaveRoom = async () => {
      try {
        await axos.post(`/api/rooms/${roomId}/leave`);
        navigate('/room');
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    };
  
    const handleJoinRequest = async (action, userId) => {
      try {
        await axos.post(`/api/rooms/${roomId}/requests`, {
          userId,
          action
        });
        await fetchRoom();
      } catch (err) {
        console.error('Error handling join request:', err);
      }
    };
  
    const handleManageAdmin = async (action, userId) => {
      try {
        await axos.post(`/api/rooms/${roomId}/admins`, {
          userId,
          action
        });
        await fetchRoom();
      } catch (err) {
        console.error('Error managing admin:', err);
      }
    };
  
    const handlePinPost = async (postId) => {
      try {
        await axos.post(`/api/rooms/${roomId}/pin`, { postId });
        await fetchRoom();
      } catch (err) {
        console.error('Error pinning post:', err);
      }
    };
  
    // Room form handlers
    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setRoomForm(prev => ({ ...prev, [name]: value }));
    };
  
    const handleAddTag = () => {
      if (newTag.trim() && !roomForm.tags.includes(newTag.trim())) {
        setRoomForm(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
      }
    };
  
    const handleRemoveTag = (tagToRemove) => {
      setRoomForm(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    };
  
    const handleCoverUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      try {
        const formData = new FormData();
        formData.append('cover', file);
        await axos.post(`/api/rooms/${roomId}/cover`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        await fetchRoom();
      } catch (err) {
        console.error('Error uploading cover:', err);
      }
    };
  
    const handleDeleteCover = async () => {
      try {
        await axos.delete(`/api/rooms/${roomId}/cover`);
        await fetchRoom();
      } catch (err) {
        console.error('Error deleting cover:', err);
      }
    };
  
    const handleUpdateRoom = async () => {
      try {
        await axos.put(`/api/rooms/${roomId}`, roomForm);
        await fetchRoom();
        setEditDialogOpen(false);
      } catch (err) {
        console.error('Error updating room:', err);
      }
    };
  
    const handleDeleteRoom = async () => {
      try {
        await axos.delete(`/api/rooms/${roomId}`);
        navigate('/room');
      } catch (err) {
        console.error('Error deleting room:', err);
      }
    };
  // ... (keep all other existing handler functions)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // When no roomId is provided (showing room creation options)
  if (!roomId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <Typography variant="h5" gutterBottom>
          No room selected
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Join an existing room or create a new one
        </Typography>
        
        <Box position="fixed" right={24} bottom={24}>
          <SpeedDial
            ariaLabel="Room actions"
            icon={<SpeedDialIcon />}
            open={speedDialOpen}
            onOpen={() => setSpeedDialOpen(true)}
            onClose={() => setSpeedDialOpen(false)}
          >
            <SpeedDialAction
              icon={<CreateIcon />}
              tooltipTitle="Create Room"
              onClick={handleCreateRoom}
            />
            <SpeedDialAction
              icon={<GroupsIcon />}
              tooltipTitle="Browse Rooms"
              onClick={() => navigate('/rooms')}
            />
          </SpeedDial>
        </Box>
      </Box>
    );
  }

  // When roomId is provided but no room data found
  if (!room) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <Typography variant="h5" gutterBottom>
          Room not found
        </Typography>
        <Typography color="text.secondary" mb={4}>
          The requested room doesn't exist or you don't have access
        </Typography>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          onClick={handleCreateRoom}
          sx={{ mb: 2 }}
        >
          Create New Room
        </Button>
        <Button
          variant="outlined"
          startIcon={<GroupsIcon />}
          onClick={() => navigate('/rooms')}
        >
          Browse Rooms
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      {/* Main Content */}
      <Box flex={1} display="flex" flexDirection="column" overflow="auto">
        {/* Room Header */}
        <Box p={3} bgcolor="background.paper" boxShadow={1}>
          {/* ... (keep existing room header JSX) */}
          
        </Box>

        {/* Room Content */}
        <Box flex={1} p={3} overflow="auto">
          <RoomPostList 
            roomId={roomId} 
            isMember={isMember} 
            pinnedPosts={room.pinnedPosts} 
            onPinPost={handlePinPost}
            isAdmin={isAdmin}
          />
        </Box>
      </Box>

      {/* Sidebar */}
      <Box width={300} bgcolor="background.paper" borderLeft={1} borderColor="divider" overflow="auto">
        <Box p={2}>
                  <Typography variant="h6" gutterBottom>
                    Room Admins
                  </Typography>
                  <RoomMemberList 
                    members={room.admins} 
                    isAdmin={isAdmin}
                    onManageAdmin={handleManageAdmin}
                    currentUserId={user?._id}
                    roomCreatorId={room.createdBy._id}
                  />
        
                  <Divider sx={{ my: 2 }} />
        
                  <Typography variant="h6" gutterBottom>
                    Members ({room.members.length})
                  </Typography>
                  <RoomMemberList 
                    members={room.members.filter(m => !room.admins.some(a => a._id === m._id))} 
                    isAdmin={isAdmin}
                    onManageAdmin={handleManageAdmin}
                    currentUserId={user?._id}
                    roomCreatorId={room.createdBy._id}
                  />
        
                  {isAdmin && room.joinRequests.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Join Requests ({room.joinRequests.length})
                      </Typography>
                      <RoomMemberList 
                        members={room.joinRequests} 
                        isAdmin={isAdmin}
                        onJoinRequest={handleJoinRequest}
                      />
                    </>
                  )}
                </Box>
      </Box>

      {/* Edit Room Dialog */}
    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Room Name"
            name="name"
            value={roomForm.name}
            onChange={handleFormChange}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={4}
            label="Description"
            name="description"
            value={roomForm.description}
            onChange={handleFormChange}
          />
          <TextField
            margin="normal"
            fullWidth
            select
            label="Room Type"
            name="roomType"
            value={roomForm.roomType}
            onChange={handleFormChange}
            SelectProps={{ native: true }}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </TextField>
          <Box mt={2}>
            <Typography variant="subtitle2">Tags</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                size="small"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} sx={{ ml: 1 }}>Add</Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {roomForm.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRoom} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this room? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRoom} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomPage;
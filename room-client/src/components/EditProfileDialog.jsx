import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  IconButton,
  Box,
  Typography,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { CameraAlt, Close, Save } from '@mui/icons-material';
import { useUIState } from '../contexts/UIStateContext';

const EditProfileDialog = ({ profile, onUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { uiState, closeUIState } = useUIState();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    profilePic: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      website: ''
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        profilePic: profile.profilePic || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          facebook: profile.socialLinks?.facebook || '',
          instagram: profile.socialLinks?.instagram || '',
          linkedin: profile.socialLinks?.linkedin || '',
          website: profile.socialLinks?.website || ''
        }
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would make an API call to update the profile
      // const response = await axios.put('/auth/me', formData);
      onUpdate(formData);
      closeUIState('editprofileDialog');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Dialog
      open={uiState.editprofileDialog}
      onClose={() => closeUIState('editprofileDialog')}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Edit Profile</Typography>
          <IconButton onClick={() => closeUIState('editprofileDialog')}>
            <Close />
          </IconButton>
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Basic Info" />
          <Tab label="Social Links" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent dividers>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={formData.profilePic || '/default-avatar.png'}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-pic-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-pic-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CameraAlt />}
                >
                  Change Photo
                </Button>
              </label>
            </Box>
            
            <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="First Name"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ pattern: "^[a-z].*", minLength: 3, maxLength: 20 }}
                helperText="Must start with lowercase letter, 3-20 characters"
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                type="email"
              />
              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Twitter URL"
              name="twitter"
              value={formData.socialLinks.twitter}
              onChange={handleSocialLinkChange}
              fullWidth
              margin="normal"
              placeholder="https://twitter.com/username"
            />
            <TextField
              label="Facebook URL"
              name="facebook"
              value={formData.socialLinks.facebook}
              onChange={handleSocialLinkChange}
              fullWidth
              margin="normal"
              placeholder="https://facebook.com/username"
            />
            <TextField
              label="Instagram URL"
              name="instagram"
              value={formData.socialLinks.instagram}
              onChange={handleSocialLinkChange}
              fullWidth
              margin="normal"
              placeholder="https://instagram.com/username"
            />
            <TextField
              label="LinkedIn URL"
              name="linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleSocialLinkChange}
              fullWidth
              margin="normal"
              placeholder="https://linkedin.com/in/username"
            />
            <TextField
              label="Website URL"
              name="website"
              value={formData.socialLinks.website}
              onChange={handleSocialLinkChange}
              fullWidth
              margin="normal"
              placeholder="https://yourwebsite.com"
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => closeUIState('editprofileDialog')}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          startIcon={<Save />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
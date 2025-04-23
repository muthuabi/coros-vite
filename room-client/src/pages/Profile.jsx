import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Button, 
  IconButton, 
  Divider,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Edit, CameraAlt, Twitter, Facebook, Instagram, LinkedIn, Language } from '@mui/icons-material';
import MyTab from '../components/MyTab';
import EditProfileDialog from '../components/EditProfileDialog';
import { useUIState } from '../contexts/UIStateContext';
import {useAuth} from '../contexts/AuthContext';
import axos from '../axos';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { openUIState } = useUIState();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user,loggedIn,setIsFetched}=useAuth();

  useEffect(() => {
    // const fetchProfile = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await axos.get('api/auth/me');
    //     setProfile(response.data);
    //   } catch (err) {
    //     setError(err.response?.data?.message || 'Failed to fetch profile');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchProfile();
    setProfile(user);
  
  }, [user]);

  const handleProfileUpdate = (updatedProfile) => {
    //setProfile(updatedProfile);
    setIsFetched((prev)=>!prev);
    // fetchUser();

  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) return null;

  // Tab configuration
  const tabLabels = [
    { label: 'Overview' },
    { label: 'Rooms' },
    { label: 'Connections' },
    { label: 'Activity' }
  ];

  const tabContents = [
    <OverviewTab profile={profile} />,
    <RoomsTab profile={profile} />,
    <ConnectionsTab profile={profile} />,
    <ActivityTab profile={profile} />
  ];

  return (
    <Box sx={{ mx: 'auto', p: 'auto'}}>
      {/* Header Section */}
      <Box sx={{ 
        position: 'relative', 
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 3
      }}>
        {/* Cover Photo */}
        <Box sx={{ 
          height: isMobile ? 150 : 250,
          bgcolor: 'primary.main',
          position: 'relative'
        }}>
{/*          <IconButton sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.default' }
          }}>
            <CameraAlt />
          </IconButton>*/}
        </Box>
        
        {/* Profile Info */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          alignItems: isMobile ? 'center' : 'flex-start',
          p: 3,
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ 
            position: 'relative',
            mt: isMobile ? -8 : -12,
            mb: isMobile ? 2 : 0,
            mx: isMobile ? 'auto' : 4
          }}>
            <Avatar
              src={profile.profilePic || '/default-avatar.png'}
              sx={{ 
                width: isMobile ? 120 : 160, 
                height: isMobile ? 120 : 160,
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: 3
              }}
            />
            <IconButton 
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
              onClick={() => openUIState('editprofileDialog')}
            >
              <CameraAlt fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="h4" component="h1">
              {profile.firstname} {profile.lastname}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            
            {profile.bio && (
              <Typography variant="body1" sx={{ my: 2 }}>
                {profile.bio}
              </Typography>
            )}
            
            {/* Social Links */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {profile.socialLinks?.twitter && (
                <IconButton 
                  color="info" 
                  href={profile.socialLinks.twitter} 
                  target="_blank"
                >
                  <Twitter />
                </IconButton>
              )}
              
              {profile.socialLinks?.facebook && (
                <IconButton 
                  color="primary" 
                  href={profile.socialLinks.facebook} 
                  target="_blank"
                >
                  <Facebook />
                </IconButton>
              )}
              
              {profile.socialLinks?.instagram && (
                <IconButton 
                  color="secondary" 
                  href={profile.socialLinks.instagram} 
                  target="_blank"
                >
                  <Instagram />
                </IconButton>
              )}
              
              {profile.socialLinks?.linkedin && (
                <IconButton 
                  color="info" 
                  href={profile.socialLinks.linkedin} 
                  target="_blank"
                >
                  <LinkedIn />
                </IconButton>
              )}
              
              {profile.socialLinks?.website && (
                <IconButton 
                  color="inherit" 
                  href={profile.socialLinks.website} 
                  target="_blank"
                >
                  <Language />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: isMobile ? 'center' : 'flex-start', mt: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={() => openUIState('editprofileDialog')}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 3 }}>
        <MyTab 
          labels={tabLabels} 
          contents={tabContents}
          tabStyles={{ mb: 3 }}
          labelStyles={{ borderBottom: 1, borderColor: 'divider' }}
        />
      </Box>
      
      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        profile={profile} 
        onUpdate={handleProfileUpdate} 
      />
    </Box>
  );
};

// Tab Content Components
const OverviewTab = ({ profile }) => (
  <Box>
    <Typography variant="h6" gutterBottom>About</Typography>
    <Typography variant="body1" paragraph>
      {profile.bio || 'No bio provided yet.'}
    </Typography>
    
    <Divider sx={{ my: 3 }} />
    
    <Typography variant="h6" gutterBottom>Contact Information</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
        <Typography variant="body1">{profile.email}</Typography>
      </Box>
      {profile.phone && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
          <Typography variant="body1">{profile.phone}</Typography>
        </Box>
      )}
      {profile.socialLinks?.website && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Website</Typography>
          <Typography variant="body1">
            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
              {profile.socialLinks.website}
            </a>
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
);

const RoomsTab = ({ profile }) => (
  <Box>
    <Typography variant="h6" gutterBottom>Joined Rooms</Typography>
    {profile.roomsJoined?.length > 0 ? (
      <Typography variant="body1">Rooms list would be displayed here</Typography>
    ) : (
      <Typography variant="body1">No rooms joined yet.</Typography>
    )}
  </Box>
);

const ConnectionsTab = ({ profile }) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" gutterBottom>Connections</Typography>
      <Typography variant="body2" color="text.secondary">
        {profile.followers?.length || 0} followers • {profile.following?.length || 0} following
      </Typography>
    </Box>
    <Typography variant="body1">Connections list would be displayed here</Typography>
  </Box>
);

const ActivityTab = ({ profile }) => (
  <Box>
    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
    <Typography variant="body1">
      {profile.postsCount || 0} posts created
    </Typography>
  </Box>
);

export default Profile;

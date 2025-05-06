import React, { useState,useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
  useMediaQuery,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Send as SendIcon
} from '@mui/icons-material';
import Carousel from 'react-bootstrap/Carousel';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const { loggedIn,user,roleBasedRoutes } = useAuth();
  const { mode, toggleColorMode } = useThemeContext();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', feedback: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate=useNavigate();
  const navigateUser=()=>{
    try{
      if(loggedIn)
      {
        navigate(roleBasedRoutes[0]?.route||"/");
      }
    }
    catch(err){
      console.error("Error navigating to user page:", err);
    }
    finally{
      console.log("Navigation Complete");
      setLoading(false);
      return;
    }
  }
  useEffect(()=>{
    navigateUser();
  },[])
 useEffect(() => {
    navigateUser();
  }, [loggedIn]);

  // Carousel data with reliable image sources
  const carouselItems = [
    {
      title: "Join Our Vibrant Community",
      description: "Connect with like-minded people across the globe",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "Create Your Unique Space",
      description: "Build and moderate your own discussion rooms",
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
    },
    {
      title: "Discover Endless Topics",
      description: "Explore thousands of communities that match your interests",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    }
  ];

  // Community data with reliable images
  const communities = [
    {
      name: "Tech Innovators",
      members: "1.2M",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Technology"
    },
    {
      name: "Gaming Universe",
      members: "2.5M",
      image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Gaming"
    },
    {
      name: "Cinema Lovers",
      members: "950K",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Movies"
    },
    {
      name: "Music Vibes",
      members: "1.8M",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      category: "Music"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSnackbar({
      open: true,
      message: 'Thank you for your feedback! We\'ll get back to you soon.',
      severity: 'success'
    });
    setFormData({ name: '', email: '', feedback: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  if(loading)
    return (       <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
            <CircularProgress />
          </Backdrop>);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <Typography variant="h4" component="div" sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg,rgb(35, 139, 170) 30%,rgb(63, 202, 236) 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CoRoS
            </Typography>
            
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: 2 }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            {loggedIn ? (
              <IconButton color="inherit">
                <AccountCircleIcon fontSize="large" />
              </IconButton>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AccountCircleIcon />}
                href="/auth/login"
                sx={{ borderRadius: 8, px: 3 }}
              >
                Login
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ width: '100%', overflow: 'hidden', mb: 6 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={500} />
        ) : (
          <Carousel controls={!isMobile} indicators={!isMobile}>
            {carouselItems.map((item, i) => (
              <Carousel.Item key={i} interval={5000}>
                <div style={{ position: 'relative', height: '500px' }}>
                  <img
                    className="d-block w-100"
                    src={item.image}
                    alt={item.title}
                    style={{ 
                      height: '100%', 
                      width: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.7)'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '40px',
                    color: 'white',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
                  }}>
                    <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 3, maxWidth: '800px' }}>
                      {item.description}
                    </Typography>
                    {/* <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      sx={{ 
                        borderRadius: 8,
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      Join Now
                    </Button> */}
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Box>
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h2" align="center" sx={{ 
          fontWeight: 700,
          mb: 6,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '80px',
            height: '4px',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            margin: '20px auto 0'
          }
        }}>
          About Our Community
        </Typography>
        
        <Box sx={{display:'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start',gap:'15px'}}>
          <Box >
            {loading ? (
              <>
              <Skeleton variant="rectangular" width={300}  height={400} sx={{ borderRadius: 4 }} />
              </>
            ) : (
              <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 6 }}>
                <CardMedia
                  
                  component="img"
                  image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Community members"
                />
              </Card>
            )}
          </Box>
          <Box >
            {loading ? (
              <>
                <Skeleton variant="text" width={300} height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={40} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" width={200} height={50} />
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                  The largest community of enthusiasts and experts
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                  <strong>CoRoS - Community-Driven Thought Sharing</strong> is where people with shared interests come together to discuss, learn, and connect. 
                  Our platform brings together millions of users from around the world.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
                  Whether you're looking to share knowledge, find answers, or just connect with like-minded people, 
                  you'll find your home here.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    borderRadius: 8,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  Learn More
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Popular Communities */}
      {/* <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ 
            fontWeight: 700,
            mb: 6,
            position: 'relative',
            '&:after': {
              content: '""',
              display: 'block',
              width: '80px',
              height: '4px',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              margin: '20px auto 0'
            }
          }}>
            Popular Communities
          </Typography>
          
          <Grid container spacing={4}>
            {loading ? (
              Array.from(new Array(4)).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%', borderRadius: 4 }}>
                    <Skeleton variant="rectangular" width="100%" height={180} />
                    <CardContent>
                      <Skeleton variant="text" width="80%" height={40} />
                      <Skeleton variant="text" width="60%" height={30} />
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 4 }} />
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              communities.map((community, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={community.image}
                      alt={community.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                        {community.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {community.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {community.members} members
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button 
                        size="medium" 
                        variant="contained" 
                        fullWidth
                        sx={{ borderRadius: 4, py: 1 }}
                      >
                        Join Community
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box> */}

      {/* Contact Form */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h2" align="center" sx={{ 
          fontWeight: 700,
          mb: 6,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '80px',
            height: '4px',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            margin: '20px auto 0'
          }
        }}>
          Contact Us
        </Typography>
        
        {loading ? (
          <Card sx={{ p: 4, borderRadius: 4 }}>
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 4 }} />
          </Card>
        ) : (
          <Card sx={{ p: 2, borderRadius: 4, boxShadow: 3 }}>
          
            <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }} 

                    />
 
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
           
                  <TextField
                    fullWidth
                    label="Your Feedback"
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleInputChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />
 
              <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    endIcon={<SendIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 4,
                      fontSize: '1.1rem'
                    }}
                  >
                    Send Message
                  </Button>
            </form>
          </Card>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} CoRoS All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Snackbar for feedback submission */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import useTheme from "@mui/material/styles/useTheme";
import Grid from "@mui/material/Grid2";
import HomeIcon from "@mui/icons-material/Home";
import Forum from "@mui/icons-material/Forum";
// import Person from "@mui/icons-material/Person";
import Notifications from "@mui/icons-material/Notifications";
import Search from "@mui/icons-material/Search";
import Menu from "@mui/icons-material/Menu";

const Home = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Check for mobile view

  const toggleDrawer = (state) => () => {
    setOpenDrawer(state);
  };
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(145deg,rgb(215, 246, 255),rgb(208, 246, 255))",
        color: "#fff",
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"} // Collapsible on mobile
        open={openDrawer}
        onClose={toggleDrawer(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "white",
            color: "#333",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button="true">
            <HomeIcon sx={{ mr: 2 }} />
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button="true">
            <Forum sx={{ mr: 2 }} />
            <ListItemText primary="Rooms" />
          </ListItem>
          {/* {isLoggedIn && (
            <ListItem button="true">
              <Person sx={{ mr: 2 }} />
              <ListItemText primary="Profile" />
            </ListItem>
          )} */}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "white", color: "#333", boxShadow: "none" }}
        >
          <Toolbar>
            {isMobile && ( // Show menu button only on mobile
              <IconButton sx={{ mr: 2 }} onClick={toggleDrawer(true)}>
                <Menu />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              CoRoS
            </Typography>
            <IconButton sx={{ mr: 2 }}>
              <Search />
            </IconButton>
            <IconButton sx={{ mr: 2 }}>
              <Notifications />
            </IconButton>
            <Button color="inherit" component={Link} to="/login">
                Login
            </Button>
            {/* {!isLoggedIn ? (
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            ) : (
              <Avatar sx={{ bgcolor: "blue" }}>U</Avatar>
            )} */}
          </Toolbar>
        </AppBar>

        {/* Feed */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ mb: 2, p: 2, bgcolor: "white" }}>
              <Typography variant="h6">📢 Welcome to Room-CLP</Typography>
              <Typography variant="body2" color="textSecondary">
                Join discussions, participate in quizzes, and explore
                educational content.
              </Typography>
            </Paper>

            {/* Example Posts with Images and Media */}
            {[1, 2, 3].map((post) => (
              <Paper key={post} elevation={3} sx={{ mb: 2, p: 2, bgcolor: "white" }}>
                <Typography variant="h6">Post Title {post}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  This is an example discussion post. Engage with the community.
                </Typography>
                <Box
                  component="img"
                  src={`https://picsum.photos/600/300?random=${post}`} // Random image for each post
                  alt="Post Media"
                  sx={{ width: "100%", borderRadius: 2, mt: 2 }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Posted 2 hours ago
                </Typography>
              </Paper>
            ))}
          </Grid>

          {/* Right Panel - Trending Rooms */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, bgcolor: "white" }}>
              <Typography variant="h6">🔥 Trending Rooms</Typography>
              <List>
                <ListItem button>
                  <ListItemText primary="JavaScript Mastery" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Data Structures & Algorithms" />
                </ListItem>
                <ListItem button>
                  <ListItemText primary="Machine Learning" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
import React, { useState, useEffect } from "react";
import DiscussionRoom from "../components/DiscussionRoom";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
  useTheme,
  ThemeProvider,
  createTheme,
  TextField,
} from "@mui/material";
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ChatBubble as CommentIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";

import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
// Create a theme instance
const drawerWidth = 240;
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode colors
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
          text: {
            primary: "#121212",
            secondary: "#4a4a4a",
          },
        }
      : {
          // Dark mode colors
          background: {
            default: "#121212",
            paper: "#1E1E1E",
          },
          text: {
            primary: "#ffffff",
            secondary: "#b0b0b0",
          },
        }),
  },
});

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  minHeight: "100vh",
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: -drawerWidth,
  [theme.breakpoints.up("sm")]: {
    marginLeft: 0,
  },
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRight: "none",
  },
}));

const dummyPosts = Array.from({ length: 5 }).map((_, idx) => ({
  id: idx,
  username: `User${idx + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${idx + 10}`,
  image: `https://picsum.photos/seed/post${idx + 1}/500/300`,
  content: `This is a dummy post #${idx + 1}. Enjoying the community vibe!`,
  createdAt: new Date(Date.now() - idx * 3600000).toLocaleString(),
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 20),
}));

export default function HomeFeed() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const theme = createTheme(getDesignTokens(mode));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };
  useEffect(() => {
    if (mode === "light") {
      navigate("/auth");
    }
  }, [mode]);

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {["Home", "Rooms", "Settings", "Profile", "Logout"].map(
          (text, index) => {
            const icons = [
              <HomeIcon />,
              <GroupIcon />,
              <SettingsIcon />,
              <AccountCircleIcon />,
              <LogoutIcon />,
            ];
            return (
              <ListItem button key={text}>
                <ListItemIcon sx={{ color: "inherit" }}>
                  {icons[index]}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            );
          }
        )}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      {/*<DiscussionRoom/>*/}
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBarStyled position="fixed">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Social Feed
            </Typography>

            {/* Search Bar - Desktop */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                width: 300,
                mr: 2,
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Search Icon - Mobile */}
            <IconButton
              color="inherit"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              sx={{ display: { xs: "flex", sm: "none" }, mr: 1 }}
            >
              <SearchIcon />
            </IconButton>

            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar
                src="https://i.pravatar.cc/150?img=33"
                alt="User Avatar"
              />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Toolbar>

          {/* Mobile Search Bar - appears when clicking search icon */}
          {showMobileSearch && (
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                p: 1,
                backgroundColor: mode === "dark" ? "#333" : "#f5f5f5",
              }}
            >
              <TextField
                autoFocus
                variant="outlined"
                size="small"
                placeholder="Search..."
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <IconButton
                onClick={() => setShowMobileSearch(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </AppBarStyled>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          {/* Desktop drawer */}
          <DrawerStyled
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
            }}
          >
            {drawer}
          </DrawerStyled>
        </Box>

        <Main
          sx={{
            margin: "auto",
            padding: { xs: 2, sm: 3 },
          }}
        >
          <Toolbar />
          {dummyPosts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </Main>
      </Box>
    </ThemeProvider>
  );
}

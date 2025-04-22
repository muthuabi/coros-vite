import React, { useState, useEffect } from "react";
// MUI Components
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import TextField from "@mui/material/TextField";

// MUI Icons
import LoginIcon from "@mui/icons-material/Login";
import DarkModeIcon from "@mui/icons-material/Brightness4";
import LightModeIcon from "@mui/icons-material/Brightness7";

import MenuIcon from "@mui/icons-material/Menu";
import { styled,useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import { useNavigate,Link,Outlet } from "react-router-dom";
import PostCard from "../components/PostCard";
import {useThemeContext} from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../contexts/AuthContext";
import Button from '@mui/material/Button';
import {useSearch} from '../contexts/SearchContext';
const drawerWidth = 240;
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
export default function Home() {
  const navigate = useNavigate();
  const theme=useTheme();
  const {loggedIn,user,roleBasedRoutes,handleLogin,logout}=useAuth();
  const {mode,toggleColorMode}=useThemeContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
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
              CoRoS
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
                value={searchQuery}
                onChange={handleSearchChange}
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
            {
              (loggedIn)?(<>

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
                src={user.profilePic || '/default-avatar.png'}
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
              <MenuItem component={Link} to={"/profile"} onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
              </>):(<Button
                component={Link}
                variant="text"
                color="default"
                startIcon={<LoginIcon />}
                to={"/auth/login"}
                // onClick={handleLogin}
              >
                Login
              </Button>)
            }
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
                value={searchQuery}
                onChange={handleSearchChange}
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
        <Sidebar rolebased drawerWidth={drawerWidth} mobileOpen={mobileOpen} roleBasedRoutes={roleBasedRoutes} handleDrawerToggle={handleDrawerToggle}/>
        <Main
          sx={{
            margin: "auto",
            padding: { xs: 2, sm: 3 },
            width:"100%"
          }}
        >
          <Toolbar />
          <Outlet/>
        </Main>
      </Box>
    </ThemeProvider>
  );
}

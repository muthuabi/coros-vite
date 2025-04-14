import React,{useState,useEffect} from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {useTheme,styled} from '@mui/material/styles';
import {Link,useLocation} from 'react-router-dom';
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

const Sidebar=(props)=>{
  const {drawerWidth,handleDrawerToggle,mobileOpen}=props;
  const theme=useTheme();
  const location=useLocation();
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

const getRole = () => {
  const user = JSON.parse(localStorage.getItem("user")); // or use your auth context
  return user?.role || "user"; // fallback to 'guest'
};

// Base role-based routes
const roleBasedRoutes = {
  guest: [
    { label: "Home", route: "/", icon: <HomeIcon /> },
    { label: "Login", route: "/auth/sign-in", icon: <AccountCircleIcon /> },
  ],
  user: [
    { label: "Home", route: "/", icon: <HomeIcon /> },
    { label: "Rooms", route: "/room", icon: <GroupIcon /> },
    { label: "Profile", route: "/profile", icon: <AccountCircleIcon /> },
    { label: "Logout", route: "/logout", icon: <LogoutIcon /> },
  ],
  admin: [
    { label: "Home", route: "/", icon: <HomeIcon /> },
    { label: "Users", route: "/admin/users", icon: <GroupIcon /> },
    { label: "Settings", route: "/admin/settings", icon: <SettingsIcon /> },
    { label: "Logout", route: "/logout", icon: <LogoutIcon /> },
  ],
};

// Dynamic room routes (will be added when in a room context)
const roomRoutes = [
  { label: "Room Settings", route: "/room/settings", icon: <SettingsIcon /> },
  { label: "Room Participants", route: "/room/participants", icon: <GroupIcon /> },
];
// Get role and generate routes
const currentUserRole = getRole(); // e.g. 'guest', 'user', 'admin'
const baseRoutes = roleBasedRoutes[currentUserRole] || roleBasedRoutes["guest"]; // Default to guest if no role

// Add room routes if we're currently on a room path
const isRoomPath = location.pathname.startsWith("/room"); // Check if the current path is a room-related one
const routes = isRoomPath ? [...baseRoutes, ...roomRoutes] : baseRoutes; // Add room routes if needed

const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {
          routes.map(
          (value, index) => {
            value.active=location.pathname===value.route;
            return (
                  <ListItem
                    button
                    component={Link}
                    to={value.route}
                    key={index}
                    sx={{
                      bgcolor: value.active ? theme.palette.action.selected : "transparent",
                      color: "inherit",
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                <ListItemIcon sx={{ color: "inherit" }}>
                  {value.icon}
                </ListItemIcon>
                <ListItemText primary={value.label} />
              </ListItem>
            );
          }
        )}
      </List>
    </div>
  );
return( <Box
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
        </Box>);
}
export default Sidebar;
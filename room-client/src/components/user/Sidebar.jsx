import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {useTheme, styled} from '@mui/material/styles';
import {Link, useLocation} from 'react-router-dom';
import iconMap from "../../utils/iconMap";

const Sidebar = (props) => {
  const {drawerWidth, handleDrawerToggle, mobileOpen, roleBasedRoutes} = props;
  const theme = useTheme();
  const location = useLocation();
  const [openRoomMenu, setOpenRoomMenu] = React.useState(false);
  
  // Check if we're in a room context
  const isRoomPath = location.pathname.startsWith('/room');
  
  // Room sub-routes
  const roomRoutes = [
    { label: "Room Settings", route: "/room/settings", icon: "SettingsIcon" },
    { label: "Room Participants", route: "/room/participants", icon: "GroupIcon" },
  ];

  // Find the "Rooms" item in the base routes and add subItems if we're in a room context
  const enhancedRoutes = roleBasedRoutes.map(route => {
    if (route.label === "Rooms" && isRoomPath) {
      return {
        ...route,
        subItems: roomRoutes,
        hasSubItems: true
      };
    }
    return route;
  });

  const handleRoomMenuClick = () => {
    setOpenRoomMenu(!openRoomMenu);
  };

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

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {enhancedRoutes.map((value, index) => {
          const isActive = location.pathname === value.route || 
                          (value.subItems && value.subItems.some(subItem => 
                            location.pathname === subItem.route));
          
          if (value.hasSubItems) {
            return (
              <React.Fragment key={index}>
                <ListItem
                  button
                  component={Link}
                  onClick={handleRoomMenuClick}
                  sx={{
                    bgcolor: isActive ? theme.palette.action.selected : "transparent",
                    color: "inherit",
                    "&:hover": {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    {iconMap(value.icon)}
                  </ListItemIcon>
                  <ListItemText primary={value.label} />
                  {openRoomMenu ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openRoomMenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {value.subItems.map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.route;
                      return (
                        <ListItem
                          button
                          component={Link}
                          to={subItem.route}
                          key={subIndex}
                          sx={{
                            pl: 4,
                            bgcolor: isSubActive ? theme.palette.action.selected : "transparent",
                            color: "inherit",
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: "inherit" }}>
                            {iconMap(subItem.icon)}
                          </ListItemIcon>
                          <ListItemText primary={subItem.label} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }

          return (
            <ListItem
              button
              component={Link}
              to={value.route}
              key={index}
              sx={{
                bgcolor: isActive ? theme.palette.action.selected : "transparent",
                color: "inherit",
           
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },

              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                {iconMap(value.icon)}
              </ListItemIcon>
              <ListItemText primary={value.label} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
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
          keepMounted: true,
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
  );
};

export default Sidebar;
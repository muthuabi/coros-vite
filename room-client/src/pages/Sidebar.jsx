import React,{useState,useStats} from 'react';
import DrawerStyled from '@mui/material/DrawerStyled';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {useTheme} from '@mui/material/styles';
import {Link} from 'react-router-dom';
const drawerWidth=240;
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
export default const Sidebar=()=>{

  const theme=useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const routes = [
    { label: "Home", route: "/", icon: <HomeIcon />, hidden: false },
    { label: "Rooms", route: "/room", icon: <GroupIcon />, hidden: false },
    { label: "Settings", route: "/settings", icon: <SettingsIcon />, hidden: false },
    { label: "Profile", route: "/profile", icon: <AccountCircleIcon />, hidden: false },
    { label: "Logout", route: "/logout", icon: <LogoutIcon />, hidden: false },
  ];
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {
          routes.map(
          (value, index) => {
            return (
              <ListItem button component={Link} to={value.route} key={index}>
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
return(     
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
    )
}
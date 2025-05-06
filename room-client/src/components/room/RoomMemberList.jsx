import { Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon, PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon, AdminPanelSettings as AdminPanelSettingsIcon, Star as StarIcon } from '@mui/icons-material';
import { useState } from 'react';

const RoomMemberList = ({ members = [], isAdmin, onManageAdmin, onJoinRequest, currentUserId, roomCreatorId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleAction = (action) => {
    if (selectedUser) {
      if (onManageAdmin) {
        onManageAdmin(action, selectedUser._id);
      } else if (onJoinRequest) {
        onJoinRequest(action, selectedUser._id);
      }
    }
    handleMenuClose();
  };

  return (
    <List dense>
      {members.map(member => (
        <ListItem
          key={member._id}
          secondaryAction={
            isAdmin && member._id !== currentUserId && (
              <>
                <IconButton edge="end" onClick={(e) => handleMenuOpen(e, member)}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl && selectedUser?._id === member._id)}
                  onClose={handleMenuClose}
                >
                  {onManageAdmin && (
                    <MenuItem onClick={() => handleAction('add')}>
                      <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Make Admin
                    </MenuItem>
                  )}
                  {onManageAdmin && (
                    <MenuItem onClick={() => handleAction('remove')}>
                      <PersonRemoveIcon sx={{ mr: 1 }} /> Remove Admin
                    </MenuItem>
                  )}
                  {onJoinRequest && (
                    <MenuItem onClick={() => handleAction('approve')}>
                      <PersonAddIcon sx={{ mr: 1 }} /> Approve
                    </MenuItem>
                  )}
                  {onJoinRequest && (
                    <MenuItem onClick={() => handleAction('reject')}>
                      <PersonRemoveIcon sx={{ mr: 1 }} /> Reject
                    </MenuItem>
                  )}
                </Menu>
              </>
            )
          }
        >
          <ListItemAvatar>
            <Avatar src={member.profilePic} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                {member.username}
                {member._id === roomCreatorId && (
                  <Tooltip title="Room Creator">
                    <StarIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                  </Tooltip>
                )}
              </Box>
            }
            secondary={member.lastActive ? `Last active: ${new Date(member.lastActive).toLocaleString()}` : ''}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default RoomMemberList;
import React, { useState } from 'react';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { Menu, MenuItem, Avatar } from '@mui/material';

export default function Topbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const isLoggedIn = true;

  return (
    <div className="flex justify-between items-center bg-gray-850 px-4 py-3 border-b border-gray-700">
      <button>
        <ArrowLeft className="text-white" />
      </button>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <Avatar
              onClick={handleMenu}
              sx={{ bgcolor: '#90caf9', cursor: 'pointer' }}
              src="https://i.pravatar.cc/40"
            />
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>My Account</MenuItem>
              <MenuItem onClick={handleClose}>Settings</MenuItem>
              <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <button className="text-blue-400 border border-blue-400 px-3 py-1 rounded hover:bg-blue-600 hover:text-white">
            Login
          </button>
        )}
      </div>
    </div>
  );
}
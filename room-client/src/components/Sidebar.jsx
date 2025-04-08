import React, { useState } from 'react';
import { Home, Group, Settings, MessageCircle, Menu } from 'lucide-react';

const menuItems = [
  { icon: <Home />, label: 'Home' },
  { icon: <Group />, label: 'Rooms' },
  { icon: <MessageCircle />, label: 'Messages' },
  { icon: <Settings />, label: 'Settings' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`bg-gray-800 transition-all duration-300 ${open ? 'w-48' : 'w-16'} flex flex-col items-center pt-4`}>
      <button onClick={() => setOpen(!open)} className="mb-6">
        <Menu />
      </button>
      {menuItems.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 py-3 px-2 hover:bg-gray-700 cursor-pointer w-full justify-center md:justify-start">
          {item.icon}
          {open && <span className="ml-2 hidden md:inline">{item.label}</span>}
        </div>
      ))}
    </div>
  );
}

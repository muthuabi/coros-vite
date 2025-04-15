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
  HelpOutline as DefaultIcon, // 👈 fallback icon
} from "@mui/icons-material";

const icons = {
  HomeIcon,
  GroupIcon,
  SettingsIcon,
  AccountCircleIcon,
  LogoutIcon,
  MoreVertIcon,
  FavoriteIcon,
  ShareIcon,
  CommentIcon,
  DarkModeIcon,
  LightModeIcon,
};

// 👇 returns a component, fallback if not found
const iconMap= (name) => {
  const Icon = icons[name] || DefaultIcon;
  return <Icon />;
};

export default iconMap;

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
  HelpOutline as DefaultIcon,
  
  // ✅ Additional Icons
  Explore as ExploreIcon,
  Notifications as NotificationsIcon,
  Bookmark as BookmarkIcon,
  Feed as FeedIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

import {
  Person as UserIcon,
  People as CommunityIcon,
  PersonAdd as FollowIcon,
  PersonRemove as UnfollowIcon,
  Verified as VerifiedIcon,
  Badge as BadgeIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";

import {
  ThumbUp as UpvoteIcon,
  ThumbDown as DownvoteIcon,
  ModeComment as ReplyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Report as ReportIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  Gavel as ModIcon,
  Block as BanIcon,
  Flag as FlagIcon,
  Security as ShieldIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

import {
  Image as ImageIcon,
  Videocam as VideoIcon,
  Poll as PollIcon,
  InsertEmoticon as EmojiIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  OpenInNew as ExternalLinkIcon,
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
  UserIcon,
  CommunityIcon
};

// 👇 returns a component, fallback if not found
const iconMap= (name) => {
  const Icon = icons[name] || DefaultIcon;
  return <Icon />;
};

export default iconMap;

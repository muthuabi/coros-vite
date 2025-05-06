import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Paper, CircularProgress, 
  LinearProgress, Chip, Avatar, Divider 
} from '@mui/material';
import { 
  BarChart, LineChart, PieChart, 
  Bar, Line, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const ADashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Dummy data generator
  const generateData = () => ({
    users: {
      total: 1248,
      active: 892,
      newToday: 42,
      growthRate: 12.5,
      byRole: [
        { name: 'Users', value: 1024 },
        { name: 'Moderators', value: 32 },
        { name: 'Admins', value: 12 }
      ],
      activity: Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString(),
        newUsers: Math.floor(Math.random() * 20) + 5,
        activeUsers: Math.floor(Math.random() * 200) + 150
      }))
    },
    content: {
      rooms: {
        total: 186,
        popular: [
          { name: 'General', members: 892, posts: 1242 },
          { name: 'Tech Talk', members: 421, posts: 832 },
          { name: 'Gaming', members: 387, posts: 721 }
        ],
        growth: Array(12).fill(0).map((_, i) => ({
          month: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
          rooms: Math.floor(Math.random() * 15) + 5
        }))
      },
      posts: {
        total: 12482,
        dailyAvg: 412,
        popular: [
          { title: 'Welcome to our community!', upvotes: 342, author: 'admin' },
          { title: 'How to get started', upvotes: 287, author: 'moderator' },
          { title: 'Latest update changelog', upvotes: 231, author: 'admin' }
        ]
      },
      moderation: {
        flagged: 42,
        actionTaken: 38,
        types: [
          { name: 'Spam', value: 18 },
          { name: 'Harassment', value: 12 },
          { name: 'Inappropriate', value: 8 },
          { name: 'Other', value: 4 }
        ]
      }
    }
  });

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setStats(generateData());
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Community Analytics</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h3">{stats.users.total}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={(stats.users.active / stats.users.total) * 100} 
              sx={{ height: 8, mt: 2 }}
            />
            <Typography variant="caption">
              {stats.users.active} active ({stats.users.growthRate}% growth)
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Rooms</Typography>
            <Typography variant="h3">{stats.content.rooms.total}</Typography>
            <Box display="flex" gap={1} mt={1}>
              {stats.content.rooms.popular.slice(0, 3).map(room => (
                <Chip 
                  key={room.name} 
                  label={room.name} 
                  size="small" 
                  avatar={<Avatar>{room.members}</Avatar>}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Posts</Typography>
            <Typography variant="h3">{stats.content.posts.total}</Typography>
            <Typography variant="body2">
              {stats.content.posts.dailyAvg} daily average
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* User Analytics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>User Growth</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.users.activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke="#8884d8" />
                <Line type="monotone" dataKey="activeUsers" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>User Roles</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.users.byRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.users.byRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Content Analytics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Room Growth</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.content.rooms.growth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rooms" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Moderation Actions</Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography>
                Flagged Content: <strong>{stats.content.moderation.flagged}</strong>
              </Typography>
              <Typography>
                Actions Taken: <strong>{stats.content.moderation.actionTaken}</strong>
              </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.content.moderation.types}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {stats.content.moderation.types.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Popular Content Section */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Popular Content</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Top Rooms</Typography>
            {stats.content.rooms.popular.map((room, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={1}>
                <Typography>{room.name}</Typography>
                <Typography color="text.secondary">
                  {room.members} members • {room.posts} posts
                </Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Top Posts</Typography>
            {stats.content.posts.popular.map((post, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={1}>
                <Typography>{post.title}</Typography>
                <Typography color="text.secondary">
                  {post.upvotes} upvotes • {post.author}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ADashboard;
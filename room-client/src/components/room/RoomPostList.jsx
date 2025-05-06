import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardHeader, Avatar, IconButton, Divider, CircularProgress } from '@mui/material';
import { Pin as PinIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import axos from '../axos';

const RoomPostList = ({ roomId, isMember, pinnedPosts = [], onPinPost, isAdmin }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axos.get(`/api/posts?roomId=${roomId}`);
        setPosts(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    if (isMember) {
      fetchPosts();
    }
  }, [roomId, isMember]);

  if (!isMember) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Join this room to view and create posts</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            <PinIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pinned Posts
          </Typography>
          {posts
            .filter(post => pinnedPosts.includes(post._id))
            .map(post => (
              <Card key={post._id} sx={{ mb: 2 }}>
                <CardHeader
                  avatar={<Avatar src={post.author.profilePic} />}
                  action={
                    isAdmin && (
                      <IconButton onClick={() => onPinPost(post._id)}>
                        <PinIcon color="primary" />
                      </IconButton>
                    )
                  }
                  title={post.author.username}
                  subheader={new Date(post.createdAt).toLocaleString()}
                />
                <CardContent>
                  <Typography>{post.content}</Typography>
                </CardContent>
              </Card>
            ))}
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

      {/* All Posts */}
      <Typography variant="h6" gutterBottom>
        Recent Posts
      </Typography>
      {posts.length === 0 ? (
        <Typography>No posts yet. Be the first to post!</Typography>
      ) : (
        posts.map(post => (
          <Card key={post._id} sx={{ mb: 2 }}>
            <CardHeader
              avatar={<Avatar src={post.author.profilePic} />}
              action={
                isAdmin && (
                  <IconButton onClick={() => onPinPost(post._id)}>
                    <PinIcon color={pinnedPosts.includes(post._id) ? 'primary' : 'disabled'} />
                  </IconButton>
                )
              }
              title={post.author.username}
              subheader={new Date(post.createdAt).toLocaleString()}
            />
            <CardContent>
              <Typography>{post.content}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default RoomPostList;
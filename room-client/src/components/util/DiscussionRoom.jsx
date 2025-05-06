import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  Paper,
  useMediaQuery,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  Favorite as LikeIcon,
  FavoriteBorder as LikeOutlineIcon,
  MoreVert as MoreIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const DiscussionRoom = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [comment, setComment] = useState('');
  const [activePost, setActivePost] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "How to optimize React performance?",
      author: "ReactDev",
      avatar: "https://i.pravatar.cc/150?img=5",
      content: "I've been struggling with rendering performance in my large React application. What are some proven optimization techniques?",
      timestamp: "2 hours ago",
      likes: 24,
      liked: false,
      tags: ["react", "performance"],
      comments: [
        {
          id: 1,
          author: "PerfExpert",
          avatar: "https://i.pravatar.cc/150?img=6",
          content: "Have you tried React.memo for your components?",
          timestamp: "1 hour ago"
        }
      ]
    },
    {
      id: 2,
      title: "State management in 2023",
      author: "StateMaster",
      avatar: "https://i.pravatar.cc/150?img=7",
      content: "What's everyone using for state management these days? Redux, Context, or something else?",
      timestamp: "4 hours ago",
      likes: 15,
      liked: true,
      tags: ["state-management", "redux"],
      comments: [
        {
          id: 1,
          author: "ZustandFan",
          avatar: "https://i.pravatar.cc/150?img=8",
          content: "Zustand is my go-to these days. Much simpler than Redux!",
          timestamp: "3 hours ago"
        },
        {
          id: 2,
          author: "ReduxLover",
          avatar: "https://i.pravatar.cc/150?img=9",
          content: "Still using Redux with Redux Toolkit. The devtools are unmatched.",
          timestamp: "2 hours ago"
        }
      ]
    }
  ]);

const handleLike = (postId, e) => {
  e?.stopPropagation(); // Prevent triggering post click when liking on mobile
  setPosts(posts.map(post => {
    if (post.id === postId) {
      const wasLiked = post.liked;
      return {
        ...post,
        liked: !wasLiked,
        likes: wasLiked ? post.likes - 1 : post.likes + 1
      };
    }
    return post;
  }));
};

  const handleCommentSubmit = (postId) => {
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      author: "CurrentUser",
      avatar: "https://i.pravatar.cc/150?img=11",
      content: comment,
      timestamp: "Just now"
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setComment('');
  };

  const handlePostClick = (post) => {
    if (isMobile) {
      setActivePost(post);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{display:"none"}}>
        <Toolbar>
          {isMobile && activePost && (
            <IconButton edge="start" color="inherit" onClick={() => setActivePost(null)}>
              <BackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {activePost ? activePost.title : "Discussion Room"}
          </Typography>
          {!isMobile && (
            <IconButton color="inherit">
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 1, flex: 1 }}>
        {!activePost ? (
          <>
            <Typography variant="h4" gutterBottom>
              JavaScript Discussions
            </Typography>
            <Typography color="text.secondary" paragraph>
              Join the conversation with other developers
            </Typography>

            <Box sx={{ mt: 4 }}>
              {posts.map(post => (
                <Paper 
                  key={post.id} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    cursor: isMobile ? 'pointer' : 'default',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => handlePostClick(post)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={post.avatar} alt={post.author} />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle1">{post.author}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.timestamp}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}>
                      {post.liked ? <LikeIcon color="error" /> : <LikeOutlineIcon />}
                    </IconButton>
                    <Typography>{post.likes}</Typography>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography paragraph>
                    {post.content}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {post.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    {post.comments.length} comments
                  </Typography>

                  {!isMobile && (
                    <>
                      {post.comments.slice(0, 2).map(comment => (
                        <Box key={comment.id} sx={{ display: 'flex', mt: 2 }}>
                          <Avatar src={comment.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {comment.author}
                            </Typography>
                            <Typography variant="body2">
                              {comment.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {comment.timestamp}
                            </Typography>
                          </Box>
                        </Box>
                      ))}

                      <Box sx={{ display: 'flex', mt: 2 }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          sx={{ mr: 1 }}
                        />
                        <Button
                          variant="contained"
                          endIcon={<SendIcon />}
                          onClick={() => handleCommentSubmit(post.id)}
                        >
                          Post
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
              ))}
            </Box>
          </>
        ) : (
          <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={activePost.avatar} alt={activePost.author} />
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1">{activePost.author}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activePost.timestamp}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton onClick={() => handleLike(activePost.id)}>
                  {activePost.liked ? <LikeIcon color="error" /> : <LikeOutlineIcon />}
                </IconButton>
                <Typography>{activePost.likes}</Typography>
              </Box>

              <Typography variant="h5" gutterBottom>
                {activePost.title}
              </Typography>
              <Typography paragraph>
                {activePost.content}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {activePost.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              {activePost.comments.length} Comments
            </Typography>

            {activePost.comments.map(comment => (
              <Box key={comment.id} sx={{ display: 'flex', mt: 2, mb: 3 }}>
                <Avatar src={comment.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {comment.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {comment.timestamp}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small">
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{ display: 'flex', mt: 4 }}>
              <Avatar src="https://i.pravatar.cc/150?img=11" sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={() => handleCommentSubmit(activePost.id)}
                  >
                    Post Comment
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default DiscussionRoom;
import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Paper, Tabs, Tab, 
  CircularProgress, Button, Dialog
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUIState } from '../contexts/UIStateContext';
import PostCard from '../components/posts/PostCard';
import QuestionCard from '../components/posts/QuestionCard';
import PostForm from '../components/posts/PostForm';
import axos from '../axos';

const PostsPage = ({ type = 'post' }) => {
  const { user } = useAuth();
  const { uiState, openUIState, closeUIState } = useUIState();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  
  const isQuestionsPage = type === 'question';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const endpoint = isQuestionsPage ? '/api/posts?type=question' : '/api/posts';
        const res = await axos.get(endpoint);
        setPosts(res.data.data.map(post => ({
          ...post,
          currentUserId: user?._id
        })));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [isQuestionsPage, user?._id]);

  const handleCreatePost = () => {
    setEditingPost(null);
    openUIState('postModal');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    openUIState('postModal');
  };

  const handleDeletePost = async (postId) => {
    try {
      setLoading(true);
      await axos.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      const res = await axos.post(`/api/posts/${postId}/vote`, { voteType });
      setPosts(posts.map(p => p._id === postId ? {
        ...res.data.data,
        currentUserId: user?._id
      } : p));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePostSuccess = (newPost) => {
    if (editingPost) {
      setPosts(posts.map(p => p._id === newPost._id ? newPost : p));
    } else {
      setPosts([{
        ...newPost,
        currentUserId: user?._id
      }, ...posts]);
    }
    closeUIState('postModal');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          {isQuestionsPage ? 'Questions' : 'Posts'}
        </Typography>
        {!isQuestionsPage && user && (
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleCreatePost}
          >
            New Post
          </Button>
        )}
      </Box>

      {loading && !posts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 3 }}>
          {posts.map(post => (
            isQuestionsPage ? (
              <QuestionCard
                key={post._id}
                question={post}
                onUpvote={() => handleVote(post._id, 'upvote')}
                onDownvote={() => handleVote(post._id, 'downvote')}
                onMenuClick={(e, post) => {
                  // Implement menu logic
                }}
                onAcceptAnswer={async (questionId, answerId) => {
                  try {
                    const res = await axos.post(`/api/posts/${questionId}/accept-answer`, { answerId });
                    setPosts(posts.map(p => p._id === questionId ? res.data.data : p));
                  } catch (error) {
                    console.error('Error accepting answer:', error);
                  }
                }}
              />
            ) : (
              <PostCard
                key={post._id}
                post={post}
                onUpvote={() => handleVote(post._id, 'upvote')}
                onDownvote={() => handleVote(post._id, 'downvote')}
                onMenuClick={(e, post) => {
                  // Implement menu logic
                }}
              />
            )
          ))}
        </Box>
      )}

      <PostForm 
        open={uiState.postModal}
        onClose={() => closeUIState('postModal')}
        post={editingPost}
        onSuccess={handlePostSuccess}
        disableQuestion={!isQuestionsPage}
      />
    </Container>
  );
};

export default PostsPage;
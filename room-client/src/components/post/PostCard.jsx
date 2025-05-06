import React from 'react';
import { 
  Card, CardHeader, CardContent, CardMedia, 
  Typography, IconButton, CardActions, Avatar,Box
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ChatBubble as CommentIcon,
  ArrowUpward,
  ArrowDownward,
  Bookmark
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

const PostCard = ({ 
  post, 
  onUpvote, 
  onDownvote, 
  onComment, 
  onShare, 
  onBookmark,
  onMenuClick 
}) => {
  const theme = useTheme();
  const isUpvoted = post.votes?.upvotes?.includes(post.currentUserId);
  const isDownvoted = post.votes?.downvotes?.includes(post.currentUserId);

  const renderMedia = () => {
    if (!post.media?.length) return null;
    
    return post.media.map((media, index) => (
      <CardMedia
        key={index}
        component={post.type === 'video' ? 'video' : 'img'}
        image={media.url}
        alt={post.content || 'Post media'}
        controls={post.type === 'video'}
        sx={{ 
          maxHeight: 400, 
          width: '100%',
          objectFit: 'cover',
          mb: 2
        }}
      />
    ));
  };

  const renderPoll = () => {
    if (post.type !== 'poll') return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        {post.pollOptions?.map((option, index) => (
          <Button
            key={index}
            fullWidth
            variant="outlined"
            sx={{ mb: 1, justifyContent: 'space-between' }}
            onClick={() => onVotePoll?.(post._id, index)}
          >
            {option.text}
            <Typography variant="caption">
              {option.votes?.length || 0} votes
            </Typography>
          </Button>
        ))}
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        avatar={<Avatar src={post.author?.profilePic} alt={post.author?.username} />}
        action={
          <IconButton onClick={(e) => onMenuClick(e, post)}>
            <MoreVertIcon />
          </IconButton>
        }
        title={post.author?.username}
        subheader={new Date(post.createdAt).toLocaleString()}
      />
      
      <CardContent>
        <Typography variant="body1" paragraph>
          {post.content}
        </Typography>
        
        {renderMedia()}
        {renderPoll()}
      </CardContent>
      
      <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
        <Box>
          <IconButton 
            onClick={() => onUpvote(post._id)}
            color={isUpvoted ? 'primary' : 'default'}
          >
            <ArrowUpward />
          </IconButton>
          <Typography variant="body2" component="span">
            {post.votes?.score || 0}
          </Typography>
          <IconButton 
            onClick={() => onDownvote(post._id)}
            color={isDownvoted ? 'error' : 'default'}
          >
            <ArrowDownward />
          </IconButton>
        </Box>
        
        <Box>
          <IconButton onClick={() => onComment(post._id)}>
            <CommentIcon />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {post.commentsCount || 0}
            </Typography>
          </IconButton>
          <IconButton onClick={() => onBookmark(post._id)}>
            <Bookmark />
          </IconButton>
          <IconButton onClick={() => onShare(post._id)}>
            <ShareIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    type: PropTypes.oneOf(['text', 'image', 'video', 'poll']).isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
      profilePic: PropTypes.string
    }),
    createdAt: PropTypes.string,
    media: PropTypes.array,
    pollOptions: PropTypes.array,
    votes: PropTypes.shape({
      upvotes: PropTypes.array,
      downvotes: PropTypes.array,
      score: PropTypes.number
    }),
    commentsCount: PropTypes.number,
    currentUserId: PropTypes.string
  }).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  onComment: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onBookmark: PropTypes.func.isRequired,
  onMenuClick: PropTypes.func.isRequired,
  onVotePoll: PropTypes.func
};

export default PostCard;
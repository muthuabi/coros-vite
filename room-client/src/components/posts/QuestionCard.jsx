import React from 'react';
import { 
  Card, CardHeader, CardContent, 
  Typography, IconButton, CardActions, Avatar,
  Chip, Box, Button
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ChatBubble as CommentIcon,
  ArrowUpward,
  ArrowDownward,
  Bookmark,
  Check
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

const QuestionCard = ({ 
  question, 
  onUpvote, 
  onDownvote, 
  onComment, 
  onShare, 
  onBookmark,
  onMenuClick,
  onAcceptAnswer
}) => {
  const theme = useTheme();
  const isUpvoted = question.votes?.upvotes?.includes(question.currentUserId);
  const isDownvoted = question.votes?.downvotes?.includes(question.currentUserId);
  const isAuthor = question.author?._id === question.currentUserId;

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardHeader
        avatar={<Avatar src={question.author?.profilePic} alt={question.author?.username} />}
        action={
          <IconButton onClick={(e) => onMenuClick(e, question)}>
            <MoreVertIcon />
          </IconButton>
        }
        title={question.author?.username}
        subheader={new Date(question.createdAt).toLocaleString()}
      />
      
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {question.questionDetails?.title}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {question.questionDetails?.tags?.map((tag, index) => (
            <Chip key={index} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
        
        <div dangerouslySetInnerHTML={{ __html: question.questionDetails?.body }} />
        
        {question.answers?.map(answer => (
          <Box key={answer._id} sx={{ 
            mt: 2, 
            p: 2, 
            border: '1px solid', 
            borderColor: answer.isAccepted ? 'success.main' : 'divider',
            borderRadius: 1,
            position: 'relative'
          }}>
            {answer.isAccepted && (
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: 10,
                bgcolor: 'success.main',
                color: 'white',
                px: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Check fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Accepted</Typography>
              </Box>
            )}
            
            <Typography variant="body2" paragraph>
              {answer.content}
            </Typography>
            
            {isAuthor && !question.questionDetails?.acceptedAnswerId && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onAcceptAnswer(question._id, answer._id)}
              >
                Accept Answer
              </Button>
            )}
          </Box>
        ))}
      </CardContent>
      
      <CardActions disableSpacing sx={{ justifyContent: 'space-between' }}>
        {/* Same action buttons as PostCard */}
      </CardActions>
    </Card>
  );
};

QuestionCard.propTypes = {
  // Similar prop types as PostCard with additional question-specific props
};

export default QuestionCard;
import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import {
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ChatBubble as CommentIcon,
} from "@mui/icons-material";
const PostCard = ({ post }) => {
  const [cardLoading, setCardLoading] = useState({});
  return (
    <Card
      key={post.id}
      sx={{
        mb: 3,
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardHeader
        avatar={<Avatar src={post.avatar} alt={post.username} />}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={post.username}
        subheader={post.createdAt}
      />
      <CardContent>
        <Typography variant="body1" color="text.primary">
          {post.content}
        </Typography>
      </CardContent>
      {!cardLoading[post.id] && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={400}
        />
      )}

      <CardMedia
        component="img"
        image={post.image}
        alt="Image Not Loaded"
        loading="lazy"
        onLoad={() => {
          setCardLoading((prev) => ({ ...prev, [post.id]: true }));
        }}
        onError={() => {
          setCardLoading((prev) => ({ ...prev, [post.id]: false }));
        }}
        sx={{ maxHeight: 400, objectFit: "cover" }}
      />

      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {post.likes}
          </Typography>
        </IconButton>
        <IconButton aria-label="comment">
          <CommentIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {post.comments}
          </Typography>
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
export default PostCard;

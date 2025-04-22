import PostCard from "../components/PostCard";
import React,{useState,useEffect} from 'react';
const posts = Array.from({ length: 5 }).map((_, idx) => ({
  id: idx,
  username: `User${idx + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${idx + 10}`,
  image: `https://picsum.photos/seed/post${idx + 1}/500/300`,
  content: `This is a dummy post #${idx + 1}. Enjoying the community vibe!`,
  createdAt: new Date(Date.now() - idx * 3600000).toLocaleString(),
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 20),
}));
// const posts=[];
const HomeFeed=()=>{
   return (<>
         {posts.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
   </>);
}
export default HomeFeed;  

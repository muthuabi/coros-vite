import React from 'react';
import { MessagesSquare, Share } from 'lucide-react';

const dummyPosts = [
  {
    id: 1,
    username: 'Karthik R',
    avatar: 'https://i.pravatar.cc/40?img=1',
    content: 'Just joined this amazing platform 🚀',
    image: 'https://source.unsplash.com/random/800x400?tech',
  },
  {
    id: 2,
    username: 'Revathi A',
    avatar: 'https://i.pravatar.cc/40?img=5',
    content: 'Check out my new blog post! ✍️',
    image: 'https://source.unsplash.com/random/800x400?nature',
  },
];

export default function Feed() {
  return (
    <div className="grid gap-6">
      {dummyPosts.map((post) => (
        <div key={post.id} className="bg-gray-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <img src={post.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
            <span className="font-semibold">{post.username}</span>
          </div>
          <p className="mb-3">{post.content}</p>
          <img src={post.image} alt="post" className="w-full rounded-md mb-3" />
          <div className="flex justify-around text-gray-400">
            <button className="flex items-center gap-1 hover:text-white cursor-pointer">
               Like
            </button>
            <button className="flex items-center gap-1 hover:text-white cursor-pointer">
              <MessagesSquare size={18} /> Comment
            </button>
            <button className="flex items-center gap-1 hover:text-white cursor-pointer">
              <Share size={18} /> Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
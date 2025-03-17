import React, { useState, useEffect, useRef } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import "../styles/chat.css";

const dummyMessages = [
  { id: 1, sender: "User", text: "Hey! How are you?", time: "10:30 AM" },
  { id: 2, sender: "Bot", text: "I'm good! How can I help?", time: "10:31 AM" },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState(dummyMessages);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { id: messages.length + 1, sender: "User", text: input, time: "Now" };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className={`chat-container ${darkMode ? "dark" : "light"}`}>
      {/* Header with Theme Toggle */}
      <div className="chat-header">
        <h2>Live Chat</h2>
        <IconButton onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </IconButton>
      </div>

      {/* Chat Messages */}
      <div className="chat-box">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender === "User" ? "user" : "bot"}`}>
            <p>{msg.text}</p>
            <span>{msg.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="chat-input">
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          sx={{
            backgroundColor: darkMode ? "#ffffff" : "#ffffff",
            color: darkMode ? "#000000" : "#ffffff",
            borderRadius: "5px",
          }}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState } from "react";
import { TextField, Button, IconButton, MenuItem } from "@mui/material";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";

const Registration = () => {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    gender: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    if (!form.username || !form.email || !form.phone || !form.gender || !form.password || !form.confirmPassword) {
      toast.error("All fields are required!", { position: "top-center" });
      return;
    }
    
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters!", { position: "top-center" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }
    
    toast.success("Registration Successful!", { position: "top-center" });
    setForm({ username: "", email: "", phone: "", gender: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="login-container">
      <div className="login-box register-box">
        <h2>Register</h2>
        <div className="group">
        <div className="group-1">
        <div className="input-group">
          <FaUser className="icon" />
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <FaPhone className="icon" />
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            variant="outlined"
            fullWidth
            value={form.phone}
            onChange={handleChange}
          />
        </div>
</div>
<div className="group-2">
        <div className="input-group">
          <TextField
            label="Gender"
            name="gender"
            select
            variant="outlined"
            fullWidth
            value={form.gender}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={form.password}
            onChange={handleChange}
          />
          <IconButton onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </IconButton>
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </IconButton>
        </div>
        </div>
    </div>
        <Button variant="contained" fullWidth onClick={handleRegister}>
          Register
        </Button>
      </div>
    </div>
  );
};

export default Registration;
import React, { useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import GoogleIcon  from "@mui/icons-material/Google";
import Box from "@mui/material/Box";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import logo_svg from '../assets/svg/chat-class.svg';
import {useNavigate} from 'react-router-dom';
import { useTogglePage } from "../pages/LoginRegister";

const dummyUsers = [
  { username: "admin", password: "admin123" },
  { username: "username", password: "password" },
];
const Login = () => {
  const navigate=useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const {setIsLoginPage}=useTogglePage();
  const [loadStatus,setLoadStatus]=useState(false);
  const validateUser=(username,password)=>{
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        const user = dummyUsers.find(
          (u) => u.username === username && u.password === password
        );
        if (user) {
          resolve(user);
        } else {
          reject("Invalid username or password!");
        }
      },2000);
  });
  }
  const handleLogin = () => {
    setLoadStatus(true);
    const validateUserPromise=validateUser(form.username,form.password);
    toast.promise(validateUserPromise,{pending:"Logging in...",success:"Login Successful!",error:"Invalid username or password!"});
    validateUserPromise
    .then((user)=>{
      navigate('/');
    })
    .catch((err)=>{
      console.log(err);
    })
    .finally(()=>{
      setLoadStatus(false);
    });
  };

  return (

        <Box className="login-inner-box">
          <div className="login-form-box">
            <div className="login-form-header">
                <img src={logo_svg} alt="logo-svg" className="login-logo-svg" />
                <div>
                  <h3>Welcome to CoRoS</h3>
                  <p>Sign in to Join the Community</p>
                </div>
            </div>
          <div className="form-group">
            <TextField
              label="Username"
              name="username"
              variant="outlined"
              fullWidth
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <Button variant="contained" loading={loadStatus} sx={{padding:"0.7em"}}  size="large" fullWidth onClick={handleLogin}>
            Login
          </Button>
            {/* <div className='or-box'>
                <div className="or-word"><b>or</b></div>
                <div className='hr'></div>
            </div> */}
            <Divider>or</Divider>
              <ButtonGroup className="" variant="outlined" sx={{borderRadius:"10px"}} aria-label="Other way of SignIn" fullWidth>
                <Button  startIcon={<GoogleIcon/>}>Google</Button>
                <Button  startIcon={<MicrosoftIcon/>}>Microsoft</Button> 
              </ButtonGroup>
            <Divider/>
            <div className='new-sign-in'>
                <div>
                    <Button variant="text" size="small">
                        Forgot Password
                    </Button>
                </div>
                <div>
                    <Button variant="text" size="small" onClick={()=>setIsLoginPage((prev)=>!prev)} >
                        Sign Up
                    </Button>
                </div>
            </div>
          </div>
        </Box>
  );
};

export default Login;

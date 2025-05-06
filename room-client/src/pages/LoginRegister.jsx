import React, { createContext, useContext, useState } from "react";
import Box from "@mui/material/Box";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import "bootstrap/dist/css/bootstrap.min.css";
import {useLocation,useNavigate,Outlet } from 'react-router-dom';
const TogglePageContext = createContext();
const useTogglePage = () => useContext(TogglePageContext);
const banner = new URL("../assets/images/login-banner-img.jpg", import.meta.url).href;
const LoginRegister = ({logregPath}) => {
    const location=useLocation();
    const navigate=useNavigate();
    const [isLoginPage, setIsLoginPage] = useState(logregPath!=="sign-up");
    const [passwordVisibilities, setPasswordVisibilities] = useState({
        password: false,
        registerPassword: false,
        registerConfirmPassword: false
    })
    const togglePasswordVisibility = (fieldname) => {
        setPasswordVisibilities(prev => ({ ...prev, [fieldname]: !prev[fieldname] }))
    }
    return (
        <Box className="login-container container-fluid row">
            <div className="login-banner col-md-6 d-none d-lg-block">
                <img src={banner} alt="Login Banner" className="banner-img" />
            </div>
            <Box className="login-box col-md-*" > 
                <TogglePageContext.Provider value={{ isLoginPage, setIsLoginPage, passwordVisibilities, setPasswordVisibilities, togglePasswordVisibility }}>
                    {logregPath!=="sign-up"? <Login /> : <Register />}
                </TogglePageContext.Provider>
            </Box>
        </Box>
    );
};

export default LoginRegister;
export { useTogglePage };

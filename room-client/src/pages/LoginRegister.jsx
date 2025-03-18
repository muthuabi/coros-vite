import React, { createContext, useContext, useState } from "react";
import Box from "@mui/material/Box";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import Login from "../components/Login";
import Register from "../components/Register";
import "bootstrap/dist/css/bootstrap.min.css";

const TogglePageContext = createContext();
const useTogglePage = () => useContext(TogglePageContext);
const banner = new URL("../assets/images/login-banner-img.jpg", import.meta.url).href;
const LoginRegister = () => {
    const [isLoginPage, setIsLoginPage] = useState(true);

    return (
        <Box className="login-container container-fluid row">
            <div className="login-banner col-md-6 d-none d-md-block d-lg-block">
                <img src={banner} alt="Login Banner" className="banner-img" />
            </div>
            <Box className="login-box col-md-6">
                <TogglePageContext.Provider value={{ isLoginPage, setIsLoginPage }}>
                    {isLoginPage ? <Login /> : <Register />}
                </TogglePageContext.Provider>
            </Box>
        </Box>
    );
};

export default LoginRegister;
export { useTogglePage };

import React, { createContext,useContext,useState } from "react";
import Box from "@mui/material/Box";
import "react-toastify/dist/ReactToastify.css";
import "../styles/login.css";
import Login from "../components/Login";
import Register from "../components/Register";
const TogglePageContext = createContext();
const useTogglePage = () => useContext(TogglePageContext);
const LoginRegister = () => {
    const [isLoginPage,setIsLoginPage]=useState(true);
    return (
    
        <Box className="login-container container-fluid">
            <Box className="login-box">
            <TogglePageContext.Provider value={{isLoginPage,setIsLoginPage}}>
               {
                (isLoginPage ? <Login /> : <Register/>)
               }
            </TogglePageContext.Provider>
            </Box>
        </Box>
    );
};
export default LoginRegister;
export { useTogglePage };

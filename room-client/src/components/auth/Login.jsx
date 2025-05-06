import React, { useState,useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo_svg from "../../assets/svg/chat-class.svg";
import { useNavigate, useLocation,Link } from "react-router-dom";
import { useTogglePage } from "../../pages/LoginRegister";
import axos from "../../axos";
import {useAuth} from "../../contexts/AuthContext";

const validationSchema = Yup.object({
  username: Yup.string()
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
});
const Login = () => {
  const navigate = useNavigate();
  const { setIsLoginPage, passwordVisibilities, togglePasswordVisibility } = useTogglePage();
  const [loginLoader,setLoginLoader] = useState(true);
  const [loadStatus,setLoadStatus]=useState(false);
  const { loggedIn, handleLogin} = useAuth();
  const location = useLocation();

 useEffect(() => {
    // If already logged in, redirect to the original page
    if (loggedIn) {
      const from = location.state?.from || "/"; // Redirect to the page the user came from
      navigate(from);
    } else {
      setLoginLoader(false);
    }
  }, [loggedIn, navigate, location.state?.from]);

  const validateUser = (username, password) => {
    return new Promise((resolve, reject) => {
      axos
        .post("/api/auth/login-user-auth", {
          username: username,
          password: password,
        })
        .then((response) => resolve(response)) // Let's see through it later
        .catch((error) =>
          reject(error?.response?.data?.message || "Network Error")
        );
    });
  };

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema,
    onSubmit: (values) => {
      setLoadStatus(true);
      const validateUserPromise = validateUser(
        values.username,
        values.password
      );
      toast.promise(validateUserPromise, {
        pending: "Logging in...",
        success: {
          render({ message }) {
            return (message||"Credentials Validated");
          }
        },
        error:{
          render({ data }) {
            return data;
          }
        },
      });
      validateUserPromise
        .then((response) => {
          handleLogin();
        })
        .catch((err) => console.log(err))
        .finally(() => setLoadStatus(false));
    },
  });
  if(loginLoader)
  {
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <CircularProgress />
      </Backdrop>
    );
  }
  return (
    <Box className="login-inner-box">
      <div className="login-form-box">
        <div className="login-form-header">
          <img src={logo_svg} alt="logo-svg" className="login-logo-svg" />
          <div>
            <h3>Welcome to CoRoS</h3>
            <p style={{ marginBottom: "0.3em" }}>
              Sign in to Join the Community
            </p>
          </div>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div className="form-group">
            <TextField
              label="Username"
              name="username"
              variant="standard"
              fullWidth
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </div>
          <div className="form-group">
            <TextField
              label="Password"
              name="password"
              type={passwordVisibilities.password ? "text" : "password"}
              variant="standard"
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ marginRight: "3px" }}>
                      <IconButton
                        onClick={() => togglePasswordVisibility("password")}
                        edge="end"
                      >
                        {passwordVisibilities.password ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>
          <Button
            variant="contained"
            type="submit"
            sx={{ padding: "0.5em", mt: "10px", borderRadius: "10px" }}
            size="large"
            fullWidth
            disabled={loadStatus}
            // loading={loadStatus}
          >
            {loadStatus ? "Logging in..." : "Login"}
          </Button>
        </form>
        <Divider>or</Divider>
        <Button variant="outlined" sx={{ borderRadius: "10px" }} fullWidth>
          <GoogleIcon />
          {/* <Typography variant="button" color="initial">Google</Typography> */}
        </Button>
        <Divider />
        <div className="new-sign-in">
          <Link to="/auth/forgot-password">
            <Button variant="text" size="small">
              Forgot Password
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="text" size="small">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </Box>
  );
};

export default Login;

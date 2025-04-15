import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import GoogleIcon from "@mui/icons-material/Google";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo_svg from "../assets/svg/chat-class.svg";
import { useNavigate, Link } from "react-router-dom";
import { useTogglePage } from "../pages/LoginRegister";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import axos from "../axos";
const validationSchema = Yup.object({
  username:Yup.string().required("Username is Required").matches(/^[a-z]/,"Username should start with lowercase alphabet").min("3","Username should be at least 3 characters").max(20,"Username shouldn't exceed 10 characters"),
  firstname: Yup.string().required("First Name is required"),
  lastname: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Invalid Indian Phone Number")
    .notRequired(),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const { setIsLoginPage, passwordVisibilities, togglePasswordVisibility } =
    useTogglePage();
  const [loadStatus, setLoadStatus] = useState(false);

  const registerUser = async (userData) => {
    const response = await axos.post("http://localhost:5000/api/auth/register-user", userData);
    return response.data;
  };

  const formik = useFormik({
    initialValues: {
      username:"",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setLoadStatus(true);
    
      const registerUserPromise = registerUser(values);
    
      toast.promise(registerUserPromise, {
        pending: "Registration in Progress...",
        success: "Registration Successful!",
        error: {
          render({ data }) {
            return data?.response?.data?.message || "Registration Failed";
          },
        },
      });
    
      registerUserPromise
        .then(() => navigate("/auth/login"))
        .catch((err) => console.log(err))
        .finally(() => setLoadStatus(false));
    },
  });

  return (
    <Box className="login-inner-box">
      <div className="login-form-box">
        <div className="login-form-header">
          <img src={logo_svg} alt="logo-svg" className="login-logo-svg" />
          <div>
            <h3>Welcome to CoRoS</h3>
            <p style={{ marginBottom: "0.3em" }}>
              Sign Up to Join the Community
            </p>
          </div>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <div className="form-group" style={{ display: "flex", gap: "10px" }}>
            <TextField
              label="First Name"
              name="firstname"
              variant="standard"
              fullWidth
              value={formik.values.firstname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstname && Boolean(formik.errors.firstname)
              }
              helperText={formik.touched.firstname && formik.errors.firstname}
            />
            <TextField
              label="Last Name"
              name="lastname"
              variant="standard"
              fullWidth
              value={formik.values.lastname}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastname && Boolean(formik.errors.lastname)}
              helperText={formik.touched.lastname && formik.errors.lastname}
            />
          </div>
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
              label="Email ID"
              name="email"
              variant="standard"
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </div>
          <div className="form-group">
            <TextField
              label="Phone Number"
              name="phone"
              variant="standard"
              fullWidth
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </div>
          <div className="form-group">
            <TextField
              label="Password"
              name="password"
              type={passwordVisibilities.registerPassword ? "text" : "password"}
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
                        onClick={() =>
                          togglePasswordVisibility("registerPassword")
                        }
                        edge="end"
                      >
                        {passwordVisibilities.registerPassword ? (
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
          <div className="form-group">
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={
                passwordVisibilities.registerConfirmPassword
                  ? "text"
                  : "password"
              }
              variant="standard"
              fullWidth
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ marginRight: "3px" }}>
                      <IconButton
                        onClick={() =>
                          togglePasswordVisibility("registerConfirmPassword")
                        }
                        edge="end"
                      >
                        {passwordVisibilities.registerConfirmPassword ? (
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
          >
            {loadStatus ? "Registering..." : "Register"}
          </Button>
        </form>
        <Divider>or</Divider>
        <Link to="/auth/login">
        <Button variant="outlined" sx={{ borderRadius: "10px" }} fullWidth>
          Sign In
          {/* <Typography variant="button" color="initial">Google</Typography> */}
        </Button>
        </Link>
        {/* <div className="new-sign-in">
          <Button variant="text" size="small">
            Forgot Password
          </Button>
          <Link to="/auth/sign-in">
            <Button variant="text" size="small">
              Sign In
            </Button>
          </Link>
        </div> */}
      </div>
    </Box>
  );
};

export default Register;

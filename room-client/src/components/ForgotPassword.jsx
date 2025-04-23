import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axos from "../axos";
const ForgotPasswordDialog = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    // navigate("/auth/sign-in"); 
    navigate(-1);
  };
//   const sendForgotMail=(email)=>{
//     return new Promise((resolve,reject)=>{
//     return axos.post("/api/auth/forgot-password",{email})
//         .then((res)=>{
//             resolve(res);
//         })
//         .catch((err)=>{
//             reject(err);
//         });
//     })
//  }
//Both Method Works Fine
const sendForgotMail = (email) => {
  return axos.post("/api/auth/forgot-password", { email });
};

const handleResetPassword = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
      toast.error("Email is required!");
      return;
  }
  if (!emailRegex.test(email.trim())) {
      toast.error("Invalid Email!");
      return;
  }
  toast.promise(
      sendForgotMail(email),
      {
          pending: "Processing request...",
          success: "Password reset email sent!",
          error: {
              render({ data }) {
                  return data.response?.data?.message || "Possibly Network Error,Try again!";
              },
          },
      }
  );
};

  return (
    <Dialog 
      open 
      onClose={(_, reason) => { if (reason !== "backdropClick") handleClose(); }} // Prevent close on outside click
      sx={{
        "& .MuiPaper-root": { 
          width:"450px",
          minWidth:"400",
          borderRadius: "12px", 
          boxShadow: "0px 6px 30px rgba(0, 0, 0, 0.3)", // Improved shadow
          backdropFilter: "blur(8px)"
        },
        "& .MuiBackdrop-root": {
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4))"
        }
      }}
    >
      {/* Dialog Header with Close Icon */}
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" }}>
        Forgot Password
        <IconButton onClick={handleClose} sx={{ color: "#888" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3 }}>
        <TextField 
          fullWidth 
          label="Your Email ID"
          type="email" 
          autoFocus
          variant="outlined" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      {/* Single Main Action Button */}
      <DialogActions sx={{ p: 3, justifyContent: "center" }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleResetPassword}
          disabled={loading}
          sx={{ 
            width: "100%", 
            fontSize: "1rem", 
            textTransform: "none", 
            borderRadius: "8px",
            py: 1.2,
            position: "relative"
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog;

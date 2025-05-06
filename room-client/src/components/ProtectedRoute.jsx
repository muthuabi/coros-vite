// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUIState } from "../contexts/UIStateContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { loggedIn, user, authLoader } = useAuth();
  const { uiState } = useUIState();
  const location = useLocation(); 
  if (authLoader) {
    return (
      <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <CircularProgress />
      </Backdrop>
    );
  }
  if (!loggedIn) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} />;
  }
  // If user doesn't have permission, redirect to forbidden page
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
};

export default ProtectedRoute;

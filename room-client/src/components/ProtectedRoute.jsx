// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { loggedIn, user } = useAuth();
  // if (user === null) {
  //   return (
  //     <Backdrop
  //       sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
  //     >
  //       <CircularProgress />
  //     </Backdrop>
  //   );
  // }
  if(user==null) return null;
  if (!loggedIn) return <Navigate to="/auth/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default ProtectedRoute;

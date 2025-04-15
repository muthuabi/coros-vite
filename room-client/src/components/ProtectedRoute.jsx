// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { loggedIn, user } = useAuth();

//   if (!loggedIn) return <Navigate to="/"/>;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/forbidden" replace/>;
  }

  return children;
};

export default ProtectedRoute;

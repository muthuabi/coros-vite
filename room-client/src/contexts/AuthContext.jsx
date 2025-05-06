// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axos from "../axos";
import { useUIState } from "../contexts/UIStateContext";

const AuthContext = createContext();

const roleRoutes = {
  visitor: [
    { label: "Home", route: "/admin", icon: "HomeIcon" },
    { label: "Login", route: "/auth/login", icon: "AccountCircleIcon" },
  ],
  user: [
    { label: "Home", route: "/route", icon: "HomeIcon" },
    { label: "Rooms", route: "/room", icon: "GroupIcon" },
    { label: "Profile", route: "/profile", icon: "AccountCircleIcon" }

  ],
  admin: [
    { label: "Home", route: "/admin/", icon: "HomeIcon" },
    { label: "Users", route: "/admin/users", icon: "GroupIcon" },
    { label: "Rooms", route: "/admin/rooms", icon: "GroupIcon" },
    { label: "Posts", route: "/admin/posts", icon: "GroupIcon" },
    { label: "Profile", route: "/admin/profile", icon: "AccountCircleIcon" },
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [roleBasedRoutes, setRoleBasedRoutes] = useState(roleRoutes.visitor);
  const [authLoader, setAuthLoader] = useState(true); 
  const { uiState } = useUIState();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFetched, setIsFetched] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);  // New state for redirect
    const fetchUser = async () => {
      try {
       if (isFetched) return; 

        setAuthLoader(true); 
        const res = await axos.get("/api/auth/me");
        const user = res.data?.data;
        setUser(user);
        setLoggedIn(!!user);
        const role = user?.role || "visitor";
        setRoleBasedRoutes(roleRoutes[role]);
        setIsFetched(true); 
      } catch (err) {
        console.error("Auth check failed:", err.message);
        setUser(null);
        setRoleBasedRoutes(roleRoutes.visitor);
      } finally {
        setAuthLoader(false);
        
      }
    };

  useEffect(() => {

    fetchUser(); // Fetch user data on moun
    // Set redirectTo state if the current location is a login or auth route
    // if (location.pathname === "/auth/login") {
    //   const from = location.state?.from || "/route";  // If no referrer, go to home
    //   setRedirectTo(from);
    // }
   
  }, [location.pathname,isFetched]);

  const handleLogin = async() => {
    await fetchUser(); // Fetch user data after login
  };

  const logout = async () => {
    try {
      setAuthLoader(true);
      await axos.post("/api/auth/logout"); 
      setUser(null);
      setLoggedIn(false);
      setIsFetched(false); 
    } catch (err) {
      console.error("Logout failed", err.message);
    } finally {
      setAuthLoader(false);
    }
  };

  return (
    <AuthContext.Provider value={{isFetched, setIsFetched,user, roleBasedRoutes, loggedIn, handleLogin, logout, authLoader,setAuthLoader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

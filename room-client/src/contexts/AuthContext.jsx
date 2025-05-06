import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axos from "../axos";
import { useUIState } from "../contexts/UIStateContext";

const AuthContext = createContext();

const roleRoutes = {
  visitor: [
    { label: "Home", route: "/", icon: "HomeIcon" },
    { label: "Login", route: "/auth/login", icon: "AccountCircleIcon" },
  ],
  user: [
    { label: "Home", route: "/user/", icon: "HomeIcon" },
    { label: "Rooms", route: "/user/room", icon: "GroupIcon" },
    { label: "Profile", route: "/user/profile", icon: "AccountCircleIcon" }
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
  const [redirectTo, setRedirectTo] = useState(null);
  
  // Add axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axos.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Attempt to refresh token
            const res = await axos.post('/api/auth/refresh', {}, {
              withCredentials: true // Important for sending refresh token cookie
            });
            
            // Retry original request with new token
            return axos(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axos.interceptors.response.eject(interceptor);
    };
  }, []);

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
      setLoggedIn(false);
      setRoleBasedRoutes(roleRoutes.visitor);
    } finally {
      setAuthLoader(false); 
    }
  };

  useEffect(() => {
    fetchUser(); 
  }, [location.pathname, isFetched]);

  const handleLogin = async (loginData) => {
    try {
      setAuthLoader(true);
      await axos.post("/api/auth/login", loginData, {
        withCredentials: true // Important for receiving cookies
      });
      await fetchUser();
    } catch (err) {
      console.error("Login failed", err.message);
      throw err;
    } finally {
      setAuthLoader(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoader(true);
      await axos.post("/api/auth/logout", {}, {
        withCredentials: true // Important for cookie clearing
      }); 
      setUser(null);
      setLoggedIn(false);
      setIsFetched(false);
      setRoleBasedRoutes(roleRoutes.visitor);
    } catch (err) {
      console.error("Logout failed", err.message);
    } finally {
      setAuthLoader(false);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{
      isFetched, 
      setIsFetched,
      user, 
      roleBasedRoutes, 
      loggedIn, 
      handleLogin, 
      logout, 
      authLoader,
      setAuthLoader 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
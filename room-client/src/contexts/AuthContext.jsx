import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  
  // Track refresh token state
  const refreshInProgress = useRef(false);
  const lastRefreshTime = useRef(0);
  const refreshQueue = useRef([]);

  // Add axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axos.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // Only handle 401 errors for authenticated routes
        if (error.response?.status === 401 && !originalRequest._retry) {
          // If we already have a refresh in progress, queue the request
          if (refreshInProgress.current) {
            return new Promise((resolve, reject) => {
              refreshQueue.current.push({ originalRequest, resolve, reject });
            });
          }
          
          // Rate limiting - don't refresh more than once every 30 seconds
          const now = Date.now();
          if (now - lastRefreshTime.current < 30000) {
            await logout();
            return Promise.reject(error);
          }
          
          originalRequest._retry = true;
          refreshInProgress.current = true;
          lastRefreshTime.current = now;
          
          try {
            // Attempt to refresh token
            const res = await axos.post('/api/auth/refresh', {}, {
              withCredentials: true
            });
            
            // Process queued requests
            while (refreshQueue.current.length) {
              const queued = refreshQueue.current.shift();
              try {
                const retryResponse = await axos(queued.originalRequest);
                queued.resolve(retryResponse);
              } catch (err) {
                queued.reject(err);
              }
            }
            
            // Retry original request
            return axos(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user and reject all queued requests
            await logout();
            refreshQueue.current.forEach(queued => queued.reject(refreshError));
            refreshQueue.current = [];
            return Promise.reject(refreshError);
          } finally {
            refreshInProgress.current = false;
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
    // try {
    //   setAuthLoader(true);
    //   await axos.post("/api/auth/login", loginData, {
    //     withCredentials: true
    //   });
      await fetchUser();
    // } catch (err) {
    //   console.error("Login failed", err.message);
    //   throw err;
    // } finally {
    //   setAuthLoader(false);
    // }
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
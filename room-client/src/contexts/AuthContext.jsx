import { createContext, useContext, useEffect, useState } from "react";
import {useLocation,useNavigate} from "react-router-dom";
import axos from "../axos";
import { useUIState } from "../contexts/UIStateContext";
const AuthContext = createContext();

// Role-based sidebar routes
const roleRoutes = {
  visitor: [
    { label: "Home", route: "/", icon: "HomeIcon" },
    { label: "Login", route: "/auth/login", icon: "AccountCircleIcon" },
  ],
  user: [
    { label: "Home", route: "/", icon: "HomeIcon" },
    { label: "Rooms", route: "/room", icon: "GroupIcon" },
    { label: "Profile", route: "/profile", icon: "AccountCircleIcon" },
  ],
  admin: [
    { label: "Home", route: "/", icon: "HomeIcon" },
    { label: "Users", route: "/admin/users", icon: "GroupIcon" },
    { label: "Settings", route: "/admin/settings", icon: "SettingsIcon" },
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loggedIn,setLoggedIn]=useState(false);
  const [roleBasedRoutes, setRoleBasedRoutes] = useState(roleRoutes.visitor);
  const {uiState}=useUIState();
  const navigate=useNavigate();
  const location=useLocation();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        uiState.globalLoader=true;
        const res = await axos.get("/api/auth/me");
        const user = res.data?.data;
        setUser(user);
        setLoggedIn(true);
        // console.log(user);
        const role = user?.role || "visitor";
        // console.log(role);
        setRoleBasedRoutes(roleRoutes[role]);
      } catch (err) {
        console.error("Auth check failed:", err.message);
        setUser(null);
        setRoleBasedRoutes(roleRoutes.visitor);
      } finally {
        uiState.globalLoader=false;
      }
    };
    if(!location.pathname.includes("auth"))
      fetchUser();
  }, [loggedIn,location.pathname]);
  const handleLogin=()=>{
    navigate("/auth/login");
  }
  const logout = async () => {
    try{
    uiState.globalLoader=true;
    await axos.post("/api/auth/logout"); // optional
    setUser(null);
    setLoggedIn(false);
    }catch(err){
      console.error("Logout Failed",err.message);
    }
    finally{
      uiState.globalLoader=false;
    }
  };
  return (
    <AuthContext.Provider value={{ user, roleBasedRoutes,loggedIn,handleLogin,logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

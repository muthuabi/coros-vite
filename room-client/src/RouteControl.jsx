import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import UserHome from "./pages/user/Home";
import AdminHome from "./pages/admin/Home";
import LoginRegister from "./pages/LoginRegister";
import ForgotPassword from "./components/auth/ForgotPassword";
import PageNotFound from "./components/util/PageNotFound";
import AccessForbidden from "./components/util/AccessForbidden";
import PostPage from "./pages/user/PostPage";
import UserProfile from "./pages/user/Profile";
import AdminProfile from "./pages/admin/Profile";
const RouteControl = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="user" element={<UserHome />} >
          <Route index element={<PostPage />} />
          <Route path="profile" element={<UserProfile/>} />
      </Route>
      <Route path="admin" element={<AdminHome />} >

      </Route>
      <Route path="auth">
        <Route index element={<Navigate to="login" />} />
        <Route path="login" element={<LoginRegister logregPath="sign-in" />} />
        <Route
          path="register"
          element={<LoginRegister logregPath="sign-up" />}
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="forbidden" element={<AccessForbidden />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
export default RouteControl;

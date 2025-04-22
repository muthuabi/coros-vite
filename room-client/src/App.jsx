import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PageNotFound from "./components/PageNotFound";
import AccessForbidden from "./components/AccessForbidden";
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister";
import "./styles/App.css";
import ForgotPasswordDialog from "./components/ForgotPassword";
import DiscussionRoom from "./components/DiscussionRoom";
import TryMUI from "./components/TryMUI";
import MarkupEditor from "./components/posts/MarkupEditor";
import { ThemeProvider } from "./contexts/ThemeContext";
import CssBaseline from "@mui/material/CssBaseline";
import { UIStateProvider } from "./contexts/UIStateContext";
import { AuthProvider } from "./contexts/AuthContext";
import Room from "./pages/Room";
import HomeFeed from "./components/HomeFeed";
import GlobalLoader from "./components/GlobalLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import PostPage from "./pages/PostPage";
function App() {
  return (
    <UIStateProvider>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <CssBaseline />
            {/* <Profile /> */}
            <div className="container-fluid main-container">
              <GlobalLoader />
              <ToastContainer stacked />
              <Routes>
                <Route
                  path="/"
                  element={ <Home />}>
                  <Route index element={<HomeFeed />} />
                  <Route path="room">
                    <Route index element={<ProtectedRoute allowedRoles={["user"]}><DiscussionRoom /></ProtectedRoute>} />
                  </Route>
                  <Route path="post">
                    <Route index element={<ProtectedRoute allowedRoles={["user"]}><PostPage/></ProtectedRoute>} />
                  </Route>
                  <Route path="profile" element={<ProtectedRoute allowedRoles={["user"]}><Profile /></ProtectedRoute>} />
                  <Route path="forbidden" element={<AccessForbidden />} />
                </Route>
 
                <Route path="auth">
                  <Route index element={<Navigate to="sign-in" />} />
                  <Route
                    path="login"
                    element={<LoginRegister logregPath="sign-in" />}
                  />
                  <Route
                    path="register"
                    element={<LoginRegister logregPath="sign-up" />}
                  />
                  <Route
                    path="forgot-password"
                    element={<ForgotPasswordDialog />}
                  />
                </Route>

                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      {/* <AdminUserPage /> */}
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      {/* <AdminSettingsPage /> */}
                    </ProtectedRoute>
                  }
                />

                <Route path="try-mui" element={<Room />} />
                <Route path="try-editor" element={<MarkupEditor />} />
                {/* <Route path="/forbidden" element={<AccessForbidden />} /> */}
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </UIStateProvider>
  );
}

export default App;

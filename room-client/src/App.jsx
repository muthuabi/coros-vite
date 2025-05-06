import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import CssBaseline from "@mui/material/CssBaseline";
import { UIStateProvider } from "./contexts/UIStateContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import GlobalLoader from "./components/util/GlobalLoader";
import RouteControl from "./RouteControl";
import {BrowserRouter as Router} from 'react-router-dom';
function App() {
  return (
    <UIStateProvider>
      <Router>
        <AuthProvider>
          <ThemeProvider>
          <SearchProvider>
            <CssBaseline />
            {/* <Profile /> */}
            <main className="container-fluid main-container">
              <GlobalLoader />
              <ToastContainer stacked />
              <RouteControl/>
            </main>
            </SearchProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </UIStateProvider>
  );
}

export default App;

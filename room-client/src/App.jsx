import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import PageNotFound from './components/PageNotFound';
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import './styles/App.css';
import ForgotPasswordDialog from './components/ForgotPassword';
import DiscussionRoom from './components/DiscussionRoom';
import TryMUI from './components/TryMUI';
import MarkupEditor from './components/MarkupEditor';
import { ThemeProvider } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { UIStateProvider } from './contexts/UIStateContext';
import Room from './pages/Room';
import HomeFeed from './components/HomeFeed';
function App() {
  return (
    <UIStateProvider>
    <ThemeProvider>
    <CssBaseline/>
    <Router>
    <div className="container-fluid main-container">
      <ToastContainer stacked/>
      <Routes>
          <Route path='/' element={<Home/>}>
               <Route index element={<HomeFeed/>} />
               <Route path='room' element={<DiscussionRoom/>}/>
          </Route>
          <Route path='auth'>
              <Route index element={<Navigate to='sign-in'/>}/>
              <Route path='login' element={<LoginRegister logregPath="sign-in" />}/>
              <Route path='register' element={<LoginRegister logregPath="sign-up" />}/>
              <Route path='forgot-password' element={<ForgotPasswordDialog/>}/>
          </Route>

          <Route path='try-mui' element={<Room/>}/>
          <Route path='try-editor' element={<MarkupEditor/>}/>
          <Route path='*' element={<PageNotFound/>}/>
      </Routes>
    </div>
    </Router>
    </ThemeProvider>
    </UIStateProvider>
  );
}

export default App;

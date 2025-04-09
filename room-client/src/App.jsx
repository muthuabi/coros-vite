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
function App() {
  return (
    <Router>
    <div className="container-fluid main-container">
    <header>
    </header>
    <main>
      <ToastContainer/>
      <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='room'>
            <Route index element={<DiscussionRoom/>}/>
          </Route>
          <Route path='auth'>
              <Route index element={<Navigate to='sign-in'/>}/>
              <Route path='sign-in' element={<LoginRegister logregPath="sign-in" />}/>
              <Route path='sign-up' element={<LoginRegister logregPath="sign-up" />}/>
              <Route path='forgot-password' element={<ForgotPasswordDialog/>}/>
          </Route>
          <Route path='try-mui' element={<TryMUI/>}/>
          <Route path='*' element={<PageNotFound/>}/>
      </Routes>
    </main>
    </div>
    </Router>
  );
}

export default App;

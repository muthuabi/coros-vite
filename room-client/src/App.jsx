import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom';
import PageNotFound from './components/PageNotFound';
import Home from './components/Home';
import LoginRegister from './pages/LoginRegister';
import './styles/App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPasswordDialog from './components/ForgotPassword';
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
          <Route path='auth'>
              <Route index element={<Navigate to='sign-in'/>}/>
              <Route path='sign-in' element={<LoginRegister logregPath="sign-in" />}/>
              <Route path='sign-up' element={<LoginRegister logregPath="sign-up" />}/>
              <Route path='forgot-password' element={<ForgotPasswordDialog/>}/>
          </Route>
          <Route path='*' element={<PageNotFound/>}/>
      </Routes>
    </main>
    </div>
    </Router>
  );
}

export default App;

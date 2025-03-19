import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import PageNotFound from './components/PageNotFound';
import Home from './components/Home';
import LoginRegister from './pages/LoginRegister';
import './styles/App.css';
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
          <Route path='/auth/*' element={<LoginRegister/>}/>
          <Route path='*' element={<PageNotFound/>}/>
      </Routes>
    </main>
    </div>
    </Router>
  );
}

export default App;

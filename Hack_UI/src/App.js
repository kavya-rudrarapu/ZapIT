
import './App.css';
import CreateTicket from './components/CreateTicket';
import Tickets from './components/Tickets';
import PastSolutions from './components/PastSolutions';
import Login from './components/Login';
import AuthCallback from './auth/callback';
import AdminLogin from './components/AdminLogin';
import Admin from './components/Admin';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute.';
import UserProtectedRoute from './components/UserProtected';
import Navbar from './components/navbar';
function App() {
  return (
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/tickets" element={<UserProtectedRoute><Navbar/><Tickets /></UserProtectedRoute>} />
            <Route
              path="/raise-ticket"
              element={
                <UserProtectedRoute>
                 <Navbar/> <CreateTicket />
                </UserProtectedRoute>
              }
              />
              <Route path="/solutions" element={<UserProtectedRoute><Navbar/><PastSolutions/></UserProtectedRoute>} />
              <Route path="/adminLogin" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtectedRoute><Admin/></AdminProtectedRoute>} />
          </Routes>
        </Router>
  );
}

export default App;

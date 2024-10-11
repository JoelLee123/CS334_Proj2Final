import React from 'react';
import '../styles/index.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './HomePage';
import SignUpPage from './SignUp';
import SignInPage from './SignIn';
import FrontPage from './StartPg';
import ProfilePage from './ProfilePage';
import NotesPage from './NotesPage';
import Navbar from "../components/NavBar";
import ResetPass from './Reset_password';  // Correct component name
import { WebSocketProvider } from "./WebSocketContext";  // Import WebSocketProvider

function App() {
  return (
    <WebSocketProvider>
    <Router>
      <div>
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/Sign-in" element={<SignInPage />} />
          <Route path="/Sign-up" element={<SignUpPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/reset-password" element={<ResetPass />} /> 
        </Routes>
      </div>
    </Router>
    </WebSocketProvider>
  );
}


function ConditionalNavbar() {
  const location = useLocation();
  const shouldHideNavbar = location.pathname === '/' || location.pathname === '/Sign-up' || location.pathname === '/Sign-in' || location.pathname === '/reset-password';

  return !shouldHideNavbar ? <Navbar /> : null;
}

export default App;

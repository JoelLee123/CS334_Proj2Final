import React from 'react';
import '../styles/index.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './Home';
import SignUpPage from './SignUp';
import SignInPage from './SignIn';
import ProfilePage from './Profile';
import Navbar from "../components/NavBar";

function App() {
  return (
    <Router>
      <div>
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/Sign-up" element={<SignUpPage />} />
          <Route path="/Profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

/**
 * Prevents the navigation bar from being shown on the sign in and sign up pages
 * @returns the navigation bar or not
 */
function ConditionalNavbar() {
  const location = useLocation();
  const shouldHideNavbar = location.pathname === '/' || location.pathname === '/Sign-up';

  return !shouldHideNavbar ? <Navbar /> : null;
}

export default App;

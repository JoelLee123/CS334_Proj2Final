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

function App() {
  return (
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
        </Routes>
      </div>
    </Router>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  const shouldHideNavbar = location.pathname === '/' || location.pathname === '/Sign-up'|| location.pathname === '/Sign-in';

  return !shouldHideNavbar ? <Navbar /> : null;
}

export default App;
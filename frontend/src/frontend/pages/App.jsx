import React from 'react'; // Import React library for building UI components
import '../styles/index.css'; // Import global CSS styles for the application
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // Import routing components from react-router-dom
import HomePage from './HomePage'; // Import the HomePage component
import SignUpPage from './SignUp'; // Import the SignUpPage component
import SignInPage from './SignIn'; // Import the SignInPage component
import FrontPage from './StartPg'; // Import the FrontPage component (starting page)
import ProfilePage from './ProfilePage'; // Import the ProfilePage component
import NotesPage from './NotesPage'; // Import the NotesPage component
import Navbar from "../components/NavBar"; // Import the Navbar component
import ResetPass from './Reset_password';  // Import the ResetPass component for password reset functionality
import { WebSocketProvider } from "./WebSocketContext";  // Import WebSocketProvider to provide WebSocket context to the app

// Main App component
function App() {
  return (
    <WebSocketProvider> {/* Wrap the app with WebSocketProvider for managing WebSocket connections */}
      <Router> {/* Router component for handling routing in the application */}
        <div>
          <ConditionalNavbar /> {/* Render Navbar conditionally based on current route */}
          <Routes> {/* Define routes for the application */}
            <Route path="/" element={<FrontPage />} /> {/* Route for the front page */}
            <Route path="/homepage" element={<HomePage />} /> {/* Route for the home page */}
            <Route path="/Sign-in" element={<SignInPage />} /> {/* Route for the sign-in page */}
            <Route path="/Sign-up" element={<SignUpPage />} /> {/* Route for the sign-up page */}
            <Route path="/Profile" element={<ProfilePage />} /> {/* Route for the profile page */}
            <Route path="/notes" element={<NotesPage />} /> {/* Route for the notes page */}
            <Route path="/reset-password" element={<ResetPass />} /> {/* Route for the password reset page */}
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

// ConditionalNavbar component to show/hide the Navbar based on the current route
function ConditionalNavbar() {
  const location = useLocation(); // Get the current location from React Router
  // Determine whether to hide the Navbar based on the current pathname
  const shouldHideNavbar = location.pathname === '/' || location.pathname === '/Sign-up' || location.pathname === '/Sign-in' || location.pathname === '/reset-password';

  return !shouldHideNavbar ? <Navbar /> : null; // Render Navbar only if it shouldn't be hidden
}

export default App; // Export the App component for use in other modules

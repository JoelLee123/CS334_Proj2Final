import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useWebSocket } from './WebSocketContext';
import image from '../images/adventuretime.png';
import { Link } from 'react-router-dom';

const FrontPage = () => {
  const navigate = useNavigate();
  const socket = useWebSocket();

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe === "true") {
      const checkAuth = async () => {
        try {
          const response = await fetch("/auth/check-auth", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const storedEmail = localStorage.getItem("email");
            const storedPassword = localStorage.getItem("password");
            const loginMessage = `login,${storedEmail},${storedPassword}`;
            localStorage.setItem("loginMessage", loginMessage);

            if (storedEmail && storedPassword) {
              if (socket && socket.readyState === WebSocket.OPEN) {
                sendLoginMessage(storedEmail, storedPassword);
              } else if (socket) {
                socket.onopen = () => {
                  sendLoginMessage(storedEmail, storedPassword);
                };

                socket.onerror = (error) => {
                  console.log("WebSocket error:", error);
                };
              } else {
                console.log("WebSocket is not initialized.");
              }

              navigate("/homepage");
            } else {
              console.log("No stored credentials found.");
              navigate("/");
            }
          } else {
            console.log("Session check failed");
            navigate("/");
          }
        } catch (error) {
          console.log("Error in authentication check", error);
          navigate("/");
        }
      };

      checkAuth();
    } else {
      console.log("No active session, redirecting...");
      navigate("/");
    }
  }, [navigate, socket]);

  const sendLoginMessage = (email, password) => {
    const loginMessage = `login,${email},${password}`;
    socket.send(loginMessage);
    console.log(`Sent WebSocket login command: ${loginMessage}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        className="absolute top-0 left-0 w-full h-full object-cover animate-pulse"
        src="/small3.gif"
        alt="Background animation"
      />

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black opacity-75"></div>

      <div className="relative z-10 text-white text-center p-5 space-y-12">
        <header className="flex justify-center items-center mt-12 mb-6">
          <h1 className="serif text-6xl font-bold drop-shadow-lg tracking-wider transform transition duration-500 hover:scale-105">
            Welcome to <span className="text-Ivory">ScribeMark testing</span>
          </h1>
        </header>

        <div className="flex flex-col items-center space-y-8">
          <img
            src={image}
            alt="Adventure illustration"
            style={{ width: '400px', height: 'auto' }}
            className="rounded-lg shadow-2xl transition-all duration-700 transform hover:scale-110 hover:rotate-3"
          />
          <h2 className="text-2xl font-semibold text-white mb-6 max-w-2xl mx-auto leading-relaxed tracking-wide">
            Capture Your Thoughts, Organize Your Ideas, and Boost Your Productivity in Style
          </h2>

          <nav className="flex flex-col items-center space-y-6">
            <Link to='/Sign-up'>
              <button className="bg-gradient-to-r from-DarkestBlue to-Ivory text-white px-8 py-4 rounded-full font-bold shadow-xl transform transition-all duration-300 hover:bg-opacity-90 hover:text-DarkestBlue hover:scale-110">
                Get Started
              </button>
            </Link>
            <Link to='/Sign-in'>
              <button className="bg-gradient-to-r from-Ivory to-DarkestBlue text-white px-8 py-4 rounded-full font-bold shadow-xl transform transition-all duration-300 hover:bg-opacity-90 hover:text-Ivory hover:scale-110">
                Login
              </button>
            </Link>
          </nav>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full text-center p-4 text-gray-400 text-sm">
        <p className="tracking-wide animate-bounce">
          Your journey to a more organized life starts here.
        </p>
      </div>
    </div>
  );
}

export default FrontPage;

import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useWebSocket } from './WebSocketContext';
import image from '../images/adventuretime.png';
import { Link } from 'react-router-dom';

const FrontPage = () => {
  const navigate = useNavigate();
  const socket = useWebSocket();  // Access the WebSocket connection

  useEffect(() => {
    const rememberMe = localStorage.getItem("rememberMe");

    if (rememberMe === "true") {
      const checkAuth = async () => {
        try {
          const response = await fetch("http://localhost:3000/auth/check-auth", {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const storedEmail = localStorage.getItem("email");
            const storedPassword = localStorage.getItem("password");

            if (storedEmail && storedPassword) {
              
              // Check if WebSocket is open or wait for it to open
              if (socket && socket.readyState === WebSocket.OPEN) {
                // If WebSocket is already open, send login command immediately
                sendLoginMessage(storedEmail, storedPassword);
              } else if (socket) {
                // Wait for the WebSocket to open, then send the login message
                socket.onopen = () => {
                  sendLoginMessage(storedEmail, storedPassword);
                };

                socket.onerror = (error) => {
                  console.log("WebSocket error:", error);
                };
              } else {
                console.log("WebSocket is not initialized.");
              }

              navigate("/homepage");  // Redirect after successful WebSocket login
            } else {
              console.log("No stored credentials found.");
              navigate("/");  // Redirect if credentials are missing
            }
          } else {
            console.log("Session check failed");
            navigate("/");  // Redirect if session is not valid
          }
        } catch (error) {
          console.log("Error in authentication check", error);
          navigate("/");  // Redirect in case of error
        }
      };

      checkAuth();  // Validate session
    } else {
      console.log("No active session, redirecting...");
      navigate("/");  // Redirect if no session
    }
  }, [navigate, socket]);  // Added socket to the dependency array

  // Function to send login message via WebSocket
  const sendLoginMessage = (email, password) => {
    const loginMessage = `login,${email},${password}`;
    socket.send(loginMessage);
    console.log(`Sent WebSocket login command: ${loginMessage}`);
  };
    return (
            <div
              className="serif min-h-screen"
              style={{
                backgroundImage: "url(/NotesPage.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
            <header className=" bg-TeaGreen flex justify-between items-center mb-4 p-5">
                <h1 className="serif text-3xl font-bold text-black">Welcome to ScribeMark</h1>
            </header>
            <nav className="flex flex-col items-center my-5">
                <img src={image} alt="An illustration of adventure" style={{ width: '300px', height: 'auto' }} className="mb-4" />
                <header>
                    <h2 className="serif text-2xl font-bold text-black text-center mb-10">
                        Capture Your Thoughts, Organize Your Ideas, and Enhance Your Productivity!
                    </h2>
                </header>
                <Link to='/Sign-up'>
                    <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
                        Sign up
                    </button>
                </Link>
                <Link to='/Sign-in'>
                    <span className="text-black underline cursor-pointer hover:text-DarkestBlue transition">
                        Already have an account? Log in
                    </span>
                </Link>
            </nav>
        </div>
    );
}

export default FrontPage;

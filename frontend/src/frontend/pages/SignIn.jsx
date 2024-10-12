import React, { useEffect, useState } from 'react';
import { FormGroup, FormControlLabel, Checkbox, Modal, Fade, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "./WebSocketContext";  // Use WebSocket context

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTicked, setIsTicked] = useState(false);
  const [error, setError] = useState(null); // Manage login error state
  const [openModal, setOpenModal] = useState(false);
  const [modalEmail, setModalEmail] = useState(""); // Email for the modal
  const [isLoginDisabled, setIsLoginDisabled] = useState(true); // State to disable login button

  const navigate = useNavigate();
  const socket = useWebSocket();  // Access the WebSocket connection

  const handleRememberMe = () => {
    setIsTicked(!isTicked); // Toggle the checkbox
  };

  // Function to open and close the modal
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => {
    setOpenModal(false);
    setModalEmail(""); // Clear email when closing modal
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedEmail) setEmail(storedEmail);
    if (storedPassword) setPassword(storedPassword);
    setIsTicked(rememberMe);
  }, []);

  useEffect(() => {
    // Enable login button only if both email and password are filled
    setIsLoginDisabled(!(email && password));
  }, [email, password]);

  // Function to handle WebSocket connection after successful login
  const connectWebSocket = (email, password) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const loginMessage = `login,${email},${password}`;
      socket.send(loginMessage);
      console.log(`Sent login command: ${loginMessage}`);
    }
  };

  const CheckValidation = async () => {
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, isTicked })
      });

      if (response.ok) {
        if (isTicked) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
          localStorage.setItem("rememberMe", "false");
        }
        connectWebSocket(email, password);
        navigate("/HomePage");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during login. Please try again later.");
    }
  };

  const handleCancel = () => navigate("/");

  const handleForgotPassword = async () => {
    try {
      const response = await fetch(`/auth/request-password-reset?email=${modalEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        setOpenModal(false);
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during password reset. Please try again later.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <img
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/small3.gif"
        alt="Background animation"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>

      <div className="relative z-10 text-white text-center p-5 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-md w-full">
          <h2 className="serif text-3xl font-bold mb-6">Sign In to ScribeMark</h2>
          <div className="flex flex-col space-y-4">
            <input
              className="border border-gray-400 bg-gray-800 bg-opacity-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border border-gray-400 bg-gray-800 bg-opacity-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={isTicked} onChange={handleRememberMe} />}
                label="Remember Me"
              />
            </FormGroup>
            {error && (
              <div className="text-red-600 text-sm mt-2">{error}</div>
            )}
            <div className="flex justify-between">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${isLoginDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={CheckValidation}
                disabled={isLoginDisabled}
              >
                Login
              </button>
            </div>
            <button className="text-blue-300 underline mt-2" onClick={handleOpen}>
              Forgot password?
            </button>
          </div>
        </div>

        <Modal open={openModal} onClose={handleClose}>
          <Fade in={openModal}>
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <Typography variant="h6">Forgot Password</Typography>
              <Typography className="mt-2">
                Please enter your email to reset your password.
              </Typography>
              <input
                className="border mt-3 p-2 rounded w-full"
                type="email"
                placeholder="Enter your email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
              />
              <div className="flex justify-end mt-3 space-x-2">
                <Button onClick={handleForgotPassword} color="primary">
                  Submit
                </Button>
                <Button onClick={handleClose} color="secondary">
                  Close
                </Button>
              </div>
            </div>
          </Fade>
        </Modal>
      </div>
    </div>
  );
};

export default SignInPage;

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
  // const [isConnected, setIsConnected] = useState(false);

  const navigate = useNavigate();

  const socket = useWebSocket();  // Access the WebSocket connection

  const handleRememberMe = () => {
    setIsTicked(!isTicked); // Toggle the checkbox
  }

  // Function to open the modal
  const handleOpen = () => {
    setOpenModal(true);
  };

  // Function to close the modal
  const handleClose = () => {
    setOpenModal(false);
    setModalEmail(""); // Clear email when closing modal
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedPassword) {
      setPassword(storedPassword);
    }

    setIsTicked(rememberMe);
  }, []);

    // Function to handle WebSocket connection after successful login
  const connectWebSocket = (email, password) => {
      // After successful login, send WebSocket login command
      if (socket && socket.readyState === WebSocket.OPEN) {
        const loginMessage = `login,${email},${password}`;
        socket.send(loginMessage);
        console.log(`Sent login command: ${loginMessage}`);
      }
  }

  // Generate a post request to the database for login 
  const CheckValidation = async () => {
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Include credentials (cookies)
        body: JSON.stringify({ email, password, isTicked })
      });

      console.log("Remember me functionality: ", isTicked);

      if (response.ok) {
        console.log(`Login successful! Remember me functionality: ${isTicked}`);

        // Adds remember me functionality and sets to true
        if (isTicked) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
          localStorage.setItem("rememberMe", "true");
        }else{
          // Clear stored credentials if not checked
          localStorage.removeItem("email");
          localStorage.removeItem("password");
          localStorage.setItem("rememberMe", "false");
        }
        
        // Connect WebSocket after successful login
        connectWebSocket(email, password);

        navigate("/HomePage");
      } else {
        setError("Invalid email or password. Please try again.");
      }

    } catch (error) { // Double check if it works
      setTimeout(()=>{
        setError("An error occurred during login. Please try again later.");
      },3000);
      
    }
  }

  const handleCancel = () => {
    navigate("/");
  }

  const handleForgotPassword = async () => {
    console.log("In functionality forgot password with email:", modalEmail);
    try {
      const response = await fetch("/auth/request-password-reset?email="+modalEmail,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Include credentials (cookies)
      });

      if (response.ok) {
        console.log(`Password reset request sent for email: ${modalEmail}`);
        setOpenModal(false); // Close modal after sending request
      } else {
        setError("Failed to send reset link. Please try again.");
      }

    } catch (error) {
      setError("An error occurred during password reset. Please try again later.");
    }
  }

  return (
    <div
      className="min-h-screen p-5 text-center"
      style={{
        backgroundImage: "url(/NotesPage.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      > 
      <header>
        <h1 className="text-3xl font-bold text-black">Sign In</h1>
      </header>

      <div className="flex flex-col space-y-4 mt-5">
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormGroup className='font-bold'>
          <FormControlLabel
            control={<Checkbox checked={isTicked} onChange={handleRememberMe} />}
            label="Remember Me"
          />
        </FormGroup>

        {error && (
          <div className="text-l text-red-700 text-sm mt-2 font-bold">
            {error}
          </div>
        )}

        <nav className='space-x-4'>
          <button className="bg-red-600 text-Ivory px-4 py-2 rounded hover:bg-red-700 transition mb-2" onClick={handleCancel}>
            Cancel
          </button>
          <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2" onClick={CheckValidation}>
            Login
          </button>
        </nav>
        <button className="text-black underline cursor-pointer hover:text-DarkestBlue transition" onClick={handleOpen}>
          Forgot password?
        </button>

        <Modal className='bg-green-800 flex items-center justify-center'
          open={openModal}
          onClose={handleClose}
        >
          <Fade in={openModal}>
            <div className="modal-content text-center bg-green-500">
              <Typography variant="h6" component="h2">
                Forgot Password
              </Typography>
              <Typography className="mt-2">
                Please enter your email address to reset your password.
              </Typography>
              <input
                type="text"
                placeholder="Enter your email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                className="border border-DarkestBlue rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
              />
              <div className="flex justify-end space-x-2 mt-3">
                <Button onClick={handleForgotPassword} color="bacl">
                  Submit
                </Button>
                <Button onClick={handleClose} color="black">
                  Close
                </Button>
              </div>
            </div>
          </Fade>
        </Modal>
      </div>
    </div>
  );
}

export default SignInPage;

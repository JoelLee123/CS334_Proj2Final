import React, { useState, useEffect } from 'react';
import { FormGroup, FormControlLabel, Checkbox, Modal, Fade, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTicked, setIsTicked] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const navigate = useNavigate();

  const handleRememberMe = () => {
    setIsTicked(!isTicked);
  };

  const handleClose = () => setOpenModal(false);

  const handleRegistration = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Sign up successful!");
        if (isTicked) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
          localStorage.setItem("rememberMe", "false");
        }
        navigate("/Sign-in");
      } else {
        if (data.error?.code === "P2002") {
          setError("Email or username already exists.");
        } else {
          setError("Sign up unsuccessful. Please try again.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    }
  };

  const handleCancel = () => navigate("/");

  // Function to validate the form
  const validateForm = () => {
    setIsFormValid(username !== "" && email !== "" && password !== "" && confirmPassword !== "");
  };

  // useEffect to validate form whenever input changes
  useEffect(() => {
    validateForm();
  }, [username, email, password, confirmPassword]);

  return (
    <div className="relative min-h-screen">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/small3.mp4"
        autoPlay
        muted
        loop
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>

      <div className="relative z-10 text-white text-center p-5 flex flex-col items-center justify-center min-h-screen">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg max-w-md w-full">
          <h2 className="serif text-3xl font-bold mb-6">Sign Up for ScribeMark</h2>
          <div className="flex flex-col space-y-4">
            <input
              className="border border-gray-400 bg-gray-800 bg-opacity-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setName(e.target.value)}
            />
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
            <input
              className="border border-gray-400 bg-gray-800 bg-opacity-50 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className={`${
                  isFormValid ? 'bg-blue-600' : 'bg-blue-400 cursor-not-allowed'
                } text-white px-4 py-2 rounded hover:bg-blue-700`}
                onClick={isFormValid ? handleRegistration : undefined}
                disabled={!isFormValid} // Disable the button if the form is not valid
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <Modal open={openModal} onClose={handleClose}>
          <Fade in={openModal}>
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <Typography variant="h6">Terms & Conditions</Typography>
              <Typography className="mt-2">
                Please review and accept the terms and conditions before signing up.
              </Typography>
              <div className="flex justify-end mt-3 space-x-2">
                <Button onClick={handleClose} color="primary">
                  Accept
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
}

export default SignUpPage;

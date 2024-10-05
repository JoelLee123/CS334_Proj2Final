import React, { useEffect, useState } from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTicked, setIsTicked] = useState(false);
  const [error, setError] = useState(null); // Manage login error state

  const navigate = useNavigate();

  const handleRememberMe = () => {
    setIsTicked(!isTicked); // Toggle the checkbox
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");
    const rememberMe = localStorage.getItem("rememberMe") ==="true";

    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedPassword) {
      setPassword(storedPassword);
    }

    setIsTicked(rememberMe);
  }, []);

  // Generate a post request to the database for login
  const CheckValidation = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Include credentials (cookies)
        body: JSON.stringify({ email, password, isTicked })
      });
    
      console.log("Remember me functionality: ", isTicked);

      const data = await response.json();

      if (response.ok) {
        // Navigate to homepage on successful login
        console.log(`Login successful! Remember me functionality: ${isTicked}`);

          // Store credentials if "Remember Me" is checked
        if (isTicked) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password); // Optionally store the password
          localStorage.setItem("rememberMe", true);
        } else {
          // Clear stored credentials if not checked
          localStorage.removeItem("email");
          localStorage.removeItem("password");
          localStorage.setItem("rememberMe", false);
        }
        
        navigate("/HomePage");
      } else {
        // If the response is not OK, set error message
        setError("Invalid email or password. Please try again.");
      }
      
    } catch (error) {
      // In case of a network or other error
      setError("An error occurred during login. Please try again later.");
    }
  }

  const handleCancel = () => {
    navigate("/");
  }

  return (
    <div className="bg-LighterBlue min-h-screen p-5 text-center">
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

        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={isTicked} onChange={handleRememberMe} />} // sets is ticked to be true
            label="Remember Me"
          />
        </FormGroup>

        {/* Conditionally render error message if it exists */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <nav>
          <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2" onClick={CheckValidation}>
            Login
          </button>
          <button className="bg-red-600 text-Ivory px-4 py-2 rounded hover:bg-red-700 transition mb-2" onClick={handleCancel}>
            Cancel
          </button>
        </nav>
      </div>
    </div>
  );
}

export default SignInPage;

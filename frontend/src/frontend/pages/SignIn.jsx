import React from 'react';
import { useState } from "react";
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  // email and password stored for validation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Allow for navigation upon validation
  const [isTicked, setIsTicked] = useState(false);
  // Manage login status
  const [error, setError] = useState(null);
  const handleRememberMe = () => {
    setIsTicked(!isTicked); // Toggle the checkbox
  }
  

  // Generate a post request to the database
  // Need to set up prisma and backend functionality
  const CheckValidation = async (e) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include", // Include credentials
        body: JSON.stringify({ email, password, isTicked })
    });
    
       console.log("Remember me functionality: ", isTicked);

       const data = await response.json();

    if (response.ok){
      // Navigate to homepage

      console.log(`Login successful! Remember me functionality: ${isTicked}`); // Corrected
      navigate("/HomePage")
    }else{
      console.log("Invalid email or password")
    }
      
    } catch (error) {
      setError("Invalid email or login")
    }
  }

 

  return (
    <div className="bg-LighterBlue min-h-screen p-5 text-center">
      <header>
        <h1 className="text-3xl font-bold text-black" >SignIn Page</h1>
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
          onChange={(e)=>setPassword(e.target.value)}
        />
        <FormGroup>
          <FormControlLabel 
            control={<Checkbox checked={isTicked} onChange={handleRememberMe} />} // sets is ticked to be true
            label="Remember Me"
          />
        </FormGroup>
      <nav>
        <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2 text-center" onClick={CheckValidation} >
          Login?
        </button>
      </nav>
      </div>
    </div>
  );
}

export default SignInPage;
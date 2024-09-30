import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  // Username and password stored for validation
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Allow for navigation upon validation
  // Manage login status
  const [setError] = useState(null);

  // Generate a post request to the database
  // Need to set up prisma and backend functionality
  const CheckValidation = async (e) => {
    try {
    
    //Testing:
    const user = {
      username: "lara",
      password: "password123"
    };

    if (username === user.username && password === user.password){
      // Navigate to homepage

      // alert("Login successful!");
      navigate("/HomePage")
    }else{
      alert("Invalid username or password")
    }
      
    } catch (error) {
      setError("Invalid username or login")
    }
  }

 

  return (
    <div className="bg-LighterBlue min-h-screen p-5 text-center">
      <header>
        <h1 className="text-3xl font-bold text-black" >My Simple React SignIn Page</h1>
      </header>
      <div className="flex flex-col space-y-4 mt-5">
        <input 
          className="border border-DarkestBlue rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          className="border border-DarkestBlue rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />
      <nav>
        <button className="bg-black text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2 text-center" onClick={CheckValidation} >
          Login?
        </button>
      </nav>
      </div>
    </div>
  );
}

export default SignInPage;
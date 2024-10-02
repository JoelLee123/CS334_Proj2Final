import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  // email and password stored for validation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Allow for navigation upon validation
  // Manage login status
  const [setError] = useState(null);

  // Generate a post request to the database
  // Need to set up prisma and backend functionality
  const CheckValidation = async (e) => {
    try {
       const response = await fetch("http://localhost:3000/auth/login", {
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify({email, password})
       });

       const data = response.json();
    
    //Testing:
    // const user = {
    //   email: "lara",
    //   password: "password123"
    // };

    if (response.ok){
      // Navigate to homepage

      alert("Login successful!");
      navigate("/HomePage")
    }else{
      alert("Invalid email or password")
    }
      
    } catch (error) {
      setError("Invalid email or login")
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
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
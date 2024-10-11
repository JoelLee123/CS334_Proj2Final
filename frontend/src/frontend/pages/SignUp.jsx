import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const[username, setName] = useState("");
  const[password, setPassword] = useState("");
  const[confirmPassword, setConfirmPassword] = useState("");
  const[email, setEmail] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null); // Manage sign up error state

  const HandleRegistration = async (e) =>{

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return; // Stop execution if passwords do not match
    }

    //Generate a get request from database
    try {
        const response = await fetch("/auth/register",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        credentials: "include", // Include credentials (cookies)
        // username, email, password
        body:JSON.stringify({"username":username, "email":email, "password": password})
        });

        const data = await response.json();
        if (response.ok){
          console.log("Sign up successful!");
          navigate("/Sign-in"); 
        }else{
          if (data.error['code'] === 'P2002'){     
            setError("Email or name already exists");
          }
          console.log("Sign up unsuccessful: ", data.error['code']);
        }
            
   } catch (error) {
     setError("User unsuccessfully signed up");
     console.log(error);
   }

  }

  const handleCancel = () => {
    navigate("/");
  }

  return (
      <div
        className="font-sans min-h-screen p-5 text-center"
        style={{
          backgroundImage: "url(/NotesPage.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      > 
      <header>
        <h1 className="text-3xl font-bold text-black">Sign Up</h1>
      </header>
      <div className="flex flex-col space-y-4 mt-5">
        <input 
          type="text"
          placeholder="Username"
          className="border border-black bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={username}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text"
          placeholder="Email"
          className="border border-black bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password"
          placeholder="Password"
          className="border border-black bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={password}
          onChange={(e) => setPassword(e.target.value)}

        />
         <input 
          type="password"
          placeholder="Confirm password"
          className="border border-black bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)}}

        />
      </div>
      <nav className="mt-5 space-x-4">
          <button className="bg-red-600 text-Ivory px-4 py-2 rounded hover:bg-red-700 transition mb-2" onClick={handleCancel}>
            Cancel
          </button>
          <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2" onClick={HandleRegistration}>
            Continue
          </button>
      </nav>
          {/* Conditionally render error message if it exists */}
          {error && (
          <div className="text-l text-red-700 text-sm mt-2 font-bold">
            {error}
          </div>
        )}

    </div>
  );
}

export default SignUpPage;

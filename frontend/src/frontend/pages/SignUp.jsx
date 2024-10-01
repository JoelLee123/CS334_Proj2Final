import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const[username, setName] = useState("");
  const[password, setPassword] = useState("");
  const[email, setEmail] = useState("");

  const navigate = useNavigate();
  const [setError]=useState(null);

  const HandleRegistration = async (e) =>{
    //Generate a get request from database
    try {
        const response = await fetch("http://localhost:3000/auth/register",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        // username, email, password
        body:JSON.stringify({"username":username, "email":email, "password": password})
        });

        const data = response.json();
        if (response.ok){
          console.log("Sign up successful!");
          navigate("/HomePage") 
        }else{
          console.log("Sign up unsuccessful!")
        }
            
   } catch (error) {
     setError("User unsuccessfully signed up")
   }

  }

  return (
    <div className="font-sans bg-LighterBlue min-h-screen p-5 text-center"> 
      <header>
        <h1 className="text-3xl font-bold text-black">SignUp Page</h1>
      </header>
      <div className="flex flex-col space-y-4 mt-5">
        <input 
          type="text"
          placeholder="Username"
          className="border border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={username}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text"
          placeholder="Email"
          className="border border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="text"
          placeholder="Password"
          className="border border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
          value={password}
          onChange={(e) => setPassword(e.target.value)}

        />
        <input 
          type="text"
          placeholder="Confirm Password"
          className="border border-black rounded p-2 focus:outline-none focus:ring-2 focus:ring-DarkestBlue"
        />
      </div>
      <nav className="mt-5">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2" onClick={HandleRegistration}>
            Continue
          </button>
      </nav>
    </div>
  );
}

export default SignUpPage;

import React from 'react';
import { Link } from 'react-router-dom';
import image from '../images/adventuretime.png';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";


const FrontPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check the "rememberMe" flag in localStorage
        const rememberMe = localStorage.getItem("rememberMe");
      
        // If "rememberMe" is true, check for an active session via cookies
        if (rememberMe === "true") {
          const checkAuth = async () => {
            try {
              const response = await fetch("http://localhost:3000/auth/check-auth", {
                method: "GET",
                credentials: "include",
              });
      
              if (response.ok) {
                console.log("here4");
                navigate("/HomePage");
              } else {
                console.log("here3");
                navigate("/");
              }
            } catch (error) {
                console.log("here2");
                navigate("/");
            }
          };
      
          // Call the checkAuth function to validate the session
          checkAuth();
        } else {
          console.log("here1");
          navigate("/");
        }
      }, [navigate]);
      


    return (
            <div
              className="serif min-h-screen"
              style={{
                backgroundImage: "url(/NotesPage.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
            <header className=" bg-DarkestBlue flex justify-between items-center mb-4 p-5">
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

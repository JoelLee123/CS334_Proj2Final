import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation();
  const [tokenParam, setToken] = useState();
  const navigate = useNavigate();


  useEffect(() => {  
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token'); // Get the token from the URL
    if (tokenParam) {
      setToken(tokenParam); // Set the token in the state
    }
  }, [location]);

  const handleSubmit = async () => {
    console.log("In resetting password");
    console.log("new password: "+password);
    console.log("token: "+tokenParam);
    if (password !== confirmPassword){
        setTimeout(()=>{ // I don't think this timeout thing works
            setError("Passwords dont match.");
          },3000);
    }else{
        try {
            const response = await fetch("http://localhost:3000/auth/reset-password",{
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include", // Include credentials (cookies)
              body: JSON.stringify({
                password: password,
                reset_token: tokenParam,
              }),
            });
      
            if (response.ok) {
              console.log(`Password reset successful`);
              navigate("/Sign-in");
            } else {
              setError("Failed to send reset link. Please try again.");
            }
      
          } catch (error) {
            setError("An error occurred during password reset. Please try again later.");
          }
    }
  };

  return (
    <div className="bg-LighterBlue min-h-screen p-5 text-center">
      <header>
        <h1 className="text-3xl font-bold text-black">Reset password</h1>
      </header>

      <div className="flex flex-col space-y-4 mt-5">
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2" onClick={handleSubmit}>
            reset password
          </button>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPass;

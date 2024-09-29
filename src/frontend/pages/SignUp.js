import React from 'react';
import { Link } from 'react-router-dom';

const SignUpPage = () => {
  return (
    <div className="font-sans bg-LighterBlue min-h-screen p-5"> 
      <header>
        <h1 className="text-3xl font-bold text-blue-800">My Simple React SignUp Page</h1>
      </header>
      <div className="flex flex-col space-y-4 mt-5">
        <input 
          type="email"
          placeholder="Email"
          className="border border-blue-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="text"
          placeholder="Username"
          className="border border-blue-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="password"
          placeholder="Password"
          className="border border-blue-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input 
          type="password"
          placeholder="Confirm Password"
          className="border border-blue-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <nav className="mt-5">
        <Link to='/homepage'>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Continue
          </button>
        </Link>
      </nav>
      <button className="bg-DarkestBlue text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
      </button>
      <button className="bg-DarkBlue text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
      </button>
      <button className="bg-LighterBlue text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
      </button>
      <button className="bg-TeaGreen text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
      </button>
      <button className="bg-Ivory text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
      </button>
    </div>
  );
}

export default SignUpPage;

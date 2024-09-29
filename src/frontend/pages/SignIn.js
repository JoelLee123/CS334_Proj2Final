import React from 'react';
import { Link } from 'react-router-dom';

const SignInPage = () => {
  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <header>
        <h1 className="text-3xl font-bold text-blue-800" >My Simple React SignIn Page</h1>
      </header>
      <nav>
        <Link to='/homepage'><button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" >Login?</button></Link>
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

export default SignInPage;
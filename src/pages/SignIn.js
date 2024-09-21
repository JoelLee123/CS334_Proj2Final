import React from 'react';
import { Link } from 'react-router-dom';

const SignInPage = () => {
  return (
    <div className="bg-blue-100 min-h-screen p-5">
      <header>
        <h1 className="text-3xl font-bold text-blue-800" >My Simple React SignIn Page</h1>
      </header>
      <nav>
        <Link to='/Sign-up'><button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" >Register?</button></Link>
      </nav>
      <nav>
        <Link to='/homepage'><button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" >Login?</button></Link>
      </nav>
    </div>
  );
}

export default SignInPage;
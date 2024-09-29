import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-800">My Simple React Profile Page</h1>
      </header>
      <nav>
        <Link to="/">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Log out?
          </button>
        </Link>
      </nav>
    </div>
  );
}

export default ProfilePage;

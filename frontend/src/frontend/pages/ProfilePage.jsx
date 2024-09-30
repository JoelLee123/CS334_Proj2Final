import React from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const ProfilePage = () => {
  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">Your Profile</h1>
      </header>
      <div className="flex flex-col items-center">
        <img 
          src="https://via.placeholder.com/150" 
          alt="User Logo" 
          className="mb-4 rounded-full"
        />
        <ProfileCard/>
        <nav className="flex space-x-4">
          <Link to="/">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Log out
            </button>
          </Link>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Edit
          </button>
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Delete
          </button>
        </nav>
      </div>
    </div>
  );
}

export default ProfilePage;

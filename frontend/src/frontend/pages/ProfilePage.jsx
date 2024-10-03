import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const ProfilePage = () => {

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMe = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user); // Access the user directly
        console.log("User details:", data.user);
      } else {
        console.log("Error fetching user details:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.log("Couldn't get user details", error);
      setError("Failed to fetch user details");
    } finally {
      setLoading(false); // Update loading state
    }
  };

  useEffect(() => {
    getMe();  // Call getMe when component mounts
  }, []); 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


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
        {/* Options: if user details are available then call the 
        profile card to display the user detail otherwise  print 
        no user details avalable */}
        { userDetails ? (
        <ProfileCard 
          username = {userDetails.username}
          email={userDetails.email}
          password = {userDetails.password}
          />
        ):(
          <p>No user details</p>
        )}
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

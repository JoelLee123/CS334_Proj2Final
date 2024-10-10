import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const ProfilePage = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState(""); 
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const navigate = useNavigate();

  const profilePictureUrls = {
    Brad: "https://media-cpt1-1.cdn.whatsapp.net/v/t61.24694-24/56517264_1685498741593588_4695015079823802368_n.jpg?ccb=11-4&oh=01_Q5AaIE4nOugA7bPL6jxL0Nv1KPzJ8FHrCANqETYymxXRknPK&oe=670DF5A6&_nc_sid=5e03e0&_nc_cat=105",
    Lara: "https://media-cpt1-1.cdn.whatsapp.net/v/t61.24694-24/458093720_455037004247885_593510724532449153_n.jpg?ccb=11-4&oh=01_Q5AaIHGsgWB48tWYrEkpH7DiBcIXQAb7j-TPHX8um7sEjr4I&oe=670E0B2F&_nc_sid=5e03e0&_nc_cat=101",
    Liam: "https://media-cpt1-1.cdn.whatsapp.net/v/t61.24694-24/417055604_1068821164388123_7197651584135595645_n.jpg?ccb=11-4&oh=01_Q5AaILacmW2UzXu5npL6-7p4r2oZ2rJ5QSeqAQ0cdoLIiX6I&oe=670E1561&_nc_sid=5e03e0&_nc_cat=100",
    Joel: "https://media-cpt1-1.cdn.whatsapp.net/v/t61.24694-24/417651412_1914928732283646_7517063463398162299_n.jpg?ccb=11-4&oh=01_Q5AaIOnUpq_Zll_n-e3n4jeXDIpzKG-m5XCdtYkjJUst8xin&oe=670DF2DF&_nc_sid=5e03e0&_nc_cat=111",
    Seisa: "https://media-cpt1-1.cdn.whatsapp.net/v/t61.24694-24/461079797_470148379505870_5179427674898775303_n.jpg?ccb=11-4&oh=01_Q5AaIP9gRGz-YpfT32RQGMJPuyBiQvtxEYV0Mj7sjGSZb2HR&oe=670E0DDB&_nc_sid=5e03e0&_nc_cat=111"
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          avatar_url: profilePictureUrls[selectedUser],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user);
        setUpdateMessage("Profile updated successfully!");
        // Reset form fields
        setUsername("");
        setPassword("");
        setSelectedUser("");
      } else {
        setUpdateMessage("Error updating profile: " + data.message);
      }
    } catch (error) {
      setUpdateMessage("Failed to update profile: " + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch('http://localhost:3000/users/me', {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          alert("Your account has been successfully deleted.");
          navigate('/'); // Navigate to StartPage
        } else {
          const data = await response.json();
          alert("Error deleting account: " + data.message);
        }
      } catch (error) {
        alert("Failed to delete account: " + error.message);
      }
    }
  };

  const getMe = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user);
        console.log("User details:", data.user);
      } else {
        console.log("Error fetching user details:", data.message);
        setError(data.message);
      }
    } catch (error) {
      console.log("Couldn't get user details", error);
      setError("Failed to fetch user details");
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  const isFormValid = username && password && selectedUser;

  if (error) return <p>Error: {error}</p>;

  return (
      <div
        className="min-h-screen p-5"
        style={{
          backgroundImage: "url(/NotesPage.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">Your Profile</h1>
      </header>
      <div className="flex flex-col items-center">
        <img 
          src={userDetails?.avatar_url || "https://via.placeholder.com/150"} 
          alt="User Avatar" 
          className="mb-4 rounded-full"
          style={{ maxWidth: '150px', maxHeight: '150px' }}
        />
        {userDetails ? (
          <ProfileCard 
            username={userDetails.username}
            email={userDetails.email}
          />
        ) : (
          <p></p>
        )}

        <div className="flex flex-col space-y-4 mt-5">
          <input
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="" disabled>Select Profile Picture</option>
            <option value="Brad">Brad</option>
            <option value="Lara">Lara</option>
            <option value="Liam">Liam</option>
            <option value="Joel">Joel</option>
            <option value="Seisa">Seisa</option>
          </select>

          <button
            className={`px-4 py-2 rounded transition mb-2 ${
              isFormValid
                ? 'bg-black text-Ivory hover:bg-DarkestBlue'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleProfileUpdate}
            disabled={!isFormValid}
          >
            Update Profile
          </button>

          {updateMessage && (
            <p className={`text-center ${updateMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {updateMessage}
            </p>
          )}
        </div>

        <nav className="flex space-x-4 mt-4">
          <Link to="/">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Log out
            </button>
          </Link>
          <button 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfilePage;
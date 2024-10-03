import React from 'react';

const ProfileCard = ({ username, email, password }) => {
    return (
        <div className="bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md">
            <h2 className="text-xl font-bold text-DarkestBlue mb-2 text-center">General</h2>
            <div className="text-DarkBlue">
                <p className="mb-2"><strong>Username:</strong> {username}</p>
                <p className="mb-2"><strong>Email:</strong> {email}</p>
            </div>
        </div>
    );
};

export default ProfileCard;
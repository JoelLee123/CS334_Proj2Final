import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar bg-green-700 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex flex-1 justify-evenly">
            <Link to="/homepage" className="flex-1 text-center text-Ivory hover:text-black">Home</Link>
            {/* <Link to="/notes" className="flex-1 text-center text-Ivory hover:text-black">Notes</Link> */}
            <Link to="/profile" className="flex-1 text-center text-Ivory hover:text-black">Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

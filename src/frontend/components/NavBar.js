import React from 'react';

function Navbar() {
    return (
      <nav className="bg-blue-500 p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="hidden md:flex space-x-4">
            <button className="text-white hover:text-gray-300" >page 1</button>
            <button className="text-white hover:text-gray-300">page 2</button>
            <button className="text-white hover:text-gray-300">page 3</button>
            <button className="text-white hover:text-gray-300">page 4</button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

export default Navbar;

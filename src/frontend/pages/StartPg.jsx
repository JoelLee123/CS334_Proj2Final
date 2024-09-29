import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import image from '../images/adventuretime.png';

const FrontPage = () => {
    const [menuOpen, setMenuOpen] = useState(false); // State to control menu visibility
    const menuRef = useRef(null); // Ref to reference the menu

    const toggleMenu = () => {
        setMenuOpen(!menuOpen); // Toggle the menu open/closed
    };

    // Close the menu if clicked outside
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setMenuOpen(false); // Close menu
        }
    };

    useEffect(() => {
        // Attach the click event listener
        document.addEventListener('mousedown', handleClickOutside);
        
        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="serif bg-LighterBlue min-h-screen">
            <header className=" bg-DarkestBlue flex justify-between items-center mb-4 p-5">
                <h1 className="serif text-3xl font-bold text-black">Welcome to ScribeMark</h1>
                <button onClick={toggleMenu} className="text-black focus:outline-none">
                    <div className="flex flex-col space-y-1">
                        <span className="block w-8 h-1 bg-black"></span>
                        <span className="block w-8 h-1 bg-black"></span>
                        <span className="block w-8 h-1 bg-black"></span>
                    </div>
                </button>
                {menuOpen && (
                    <nav ref={menuRef} className=" flex flex-col absolute right-5 bg-white shadow-md rounded">
                        <Link to='/About' className="text-black hover:text-blue-600 p-2">About Us</Link>
                        <Link to='/Features' className="text-black hover:text-blue-600 p-2">Features</Link>
                        <Link to='/Contact' className="text-black hover:text-blue-600 p-2">Contact</Link>
                    </nav>
                )}
            </header>
            <nav className="flex flex-col items-center my-5">
                <img src={image} alt="An illustration of adventure" style={{ width: '300px', height: 'auto' }} className="mb-4" />
                <header>
                    <h2 className="serif text-2xl font-bold text-black text-center mb-10">
                        Capture Your Thoughts, Organize Your Ideas, and Enhance Your Productivity!
                    </h2>
                </header>
                <Link to='/Sign-up'>
                    <button className="bg-black text-white px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
                        Sign up
                    </button>
                </Link>
                <Link to='/Sign-in'>
                    <span className="text-black underline cursor-pointer hover:text-DarkestBlue transition">
                        Already have an account? Log in
                    </span>
                </Link>
            </nav>
        </div>
    );
}

export default FrontPage;

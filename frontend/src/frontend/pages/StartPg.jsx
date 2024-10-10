import React from 'react';
import { Link } from 'react-router-dom';
import image from '../images/adventuretime.png';

const FrontPage = () => {
    return (
            <div
              className="serif min-h-screen"
              style={{
                backgroundImage: "url(/NotesPage.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
            <header className=" bg-DarkestBlue flex justify-between items-center mb-4 p-5">
                <h1 className="serif text-3xl font-bold text-black">Welcome to ScribeMark</h1>
            </header>
            <nav className="flex flex-col items-center my-5">
                <img src={image} alt="An illustration of adventure" style={{ width: '300px', height: 'auto' }} className="mb-4" />
                <header>
                    <h2 className="serif text-2xl font-bold text-black text-center mb-10">
                        Capture Your Thoughts, Organize Your Ideas, and Enhance Your Productivity!
                    </h2>
                </header>
                <Link to='/Sign-up'>
                    <button className="bg-black text-Ivory px-4 py-2 rounded hover:bg-DarkestBlue transition mb-2">
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

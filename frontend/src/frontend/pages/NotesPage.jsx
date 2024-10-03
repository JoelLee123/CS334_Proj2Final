import { useState } from 'react';
import React, { useEffect } from 'react';
import NoteCard from '../components/NoteCard';  // Adjust the import path as necessary


// Gets the list of notes
const NotesPage = () => {

  const [notes, setNotes] = useState([]);
  const [searchTitle, setSearch]=useState("");
  const [categoryId, setCategoryId]=useState("");
  const [categories, setCategories] = useState([]);

  const getNotes = async () => {
    try {
      const response = await fetch("http://localhost:3000/notes/all", {
       method:"GET",
       credentials: 'include'
      });

      const data = await response.json();
      // const sampleNotes = data.notes;

      if (response.ok){
        console.log("Note fetched")
        console.log(data.notes);
        setNotes(data.notes);
      } else {
        console.log("Note not fetched", data.message);
      }
        
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchTitle = async () => {
    console.log({searchTitle});
  };

  useEffect(() => {
    getNotes();  // Call getNotes when component mounts
  }, []); 

  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">Your notes</h1>
      <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-4">
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          type="text"
          placeholder="Enter title"
          value={searchTitle}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearchTitle}
          className="bg-DarkestBlue text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
        <select
          className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          value={categoryId}
          // onClick={getAllCategories}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="" disabled>
            Filter by category
          </option>
          {categories.map((category, index) => (
            <option 
            key={index} value={category}
            category = {category.category}>
            <h3 className="text-xl font-bold text-DarkestBlue">{category.category}</h3>
              {/* {category.name} */}
            </option>
          ))}
        </select>
      </div>
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              date={note.created_at}
              ID={note.id}
              category={note.category}
              content={note.content}
            />
          ))
        ) : (
          <p className='text-DarkestBlue'
          >Loading your notes...</p>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
import { useState } from 'react';
import React, { useEffect } from 'react';
import NoteCard from '../components/NoteCard';  // Adjust the import path as necessary

// Gets the list of notes
const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [searchTitle, setSearch]=useState("");
  const [categoryId, setCategoryId]=useState("");
  const [selectTime, setSelectedTime] = useState("");

  const getNotes = async () => {
    try {
      const response = await fetch("http://localhost:3000/notes/all", {
       method:"GET",
       credentials: 'include'
      });

      const data = await response.json();

      if (response.ok){
        console.log("Note fetched: ", data.notes)

        setNotes(data.notes);
      } else {
        console.log("Note not fetched", data.message);
      }
        
    } catch (error) {
      console.error(error);
    }
  };

  // Filter notes based on searchTitle and well as time
  const filter = notes.filter(note => { // changed
    console.log("here with title: ", searchTitle);
    const matchTitle = searchTitle.trim()
    ? note.title.toLowerCase().includes(searchTitle.toLowerCase())
    :true;

    const matchTime = selectTime
    ? new Date(note.created_at).toISOString().split('T')[0] === selectTime
    : true;
    console.log("selected time: ", matchTime);
    console.log("created at times: ", note.created_at);

    return matchTime && matchTitle;
  });

  useEffect(() => {
    getNotes();  // Call getNotes when component mounts, needs to set to one instance 
  }, []); 

  // choose between the three states of the notes
  const notesDisplayed = searchTitle || selectTime ? filter : notes; 

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
          <select 
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={selectTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            
          >
            <option value="" >Select a created time</option>
            {[...new Set(notes.map(note => new Date(note.created_at).toISOString().split('T')[0]))].map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
          {/* <select 
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled> Apply filter</option>
            {notes.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select> */}
      </div>
      {notesDisplayed.length > 0 ? ( // Applying filtering based on notes
          notesDisplayed.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              date={new Date(note.created_at).toLocaleString()} // Needs to be fixed 
              ID={note.id}
              category={note.category}
              content={note.content}
              getNotes={getNotes}
            />
          ))
        ) : (
          <p className='text-DarkestBlue'>
          {notes.length > 0 ? "Loading your notes..." : "No notes available"} {/*this might not be working*/}
        </p>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
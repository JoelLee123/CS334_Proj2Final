import { useState } from 'react';
import React, { useEffect }from 'react';
import NoteCard from '../components/NoteCard';  // Adjust the import path as necessary


// Gets the list of notes
const NotesPage = () => {

  const [notes, setNotes] = useState([]);

  const getNotes = async () => {
    try {
      const response = await fetch("http://localhost:3000/notes/all", {
       method:"GET",
       credentials: 'include'
      });

      const data = await response.json();
      // const sampleNotes = data.notes;

      if (response.ok){
        console.log("Note saved")
        console.log(data.notes);
        setNotes(data.notes);
      } else {
        console.log("Note not saved", data.message);
      }
        
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    getNotes();  // Call getNotes when component mounts
  }, []); 

  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">Your notes</h1>
      <div className="flex flex-col items-center">
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
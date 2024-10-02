import React from 'react';
import NoteCard from '../components/NoteCard';  // Adjust the import path as necessary

const NotesPage = () => {
  const sampleNotes = [
    { title: "Meeting Notes", category: "New Category", content: "Discussed project timeline and delegated tasks.", date: "2023-10-01 10:00 AM" },
    { title: "Ideas", category: "Joel's category", content: "New feature: implement dark mode for better night-time usage.", date: "2023-10-02 02:30 PM" },
    { title: "To-Do", category: "Uni", content: "1. Fix bug in login page\n2. Update user documentation\n3. Prepare for team meeting", date: "2023-10-03 09:00 AM" },
  ];

  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">Your notes</h1>
      <div className="flex flex-col items-center">
        {sampleNotes.map((note, index) => (
          <NoteCard key={index} title={note.title} category={note.category} content={note.content} date={note.date} />
        ))}
      </div>
    </div>
  );
}

export default NotesPage;
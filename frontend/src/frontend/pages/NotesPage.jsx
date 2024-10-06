import { useState } from 'react';
import React, { useEffect } from 'react';
import NoteCard from '../components/NoteCard';  // Adjust the import path as necessary

// Gets the list of notes
const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTitle, setSearch]=useState("");
  const [selectCategory, setSelectedCategory]=useState("");
  const [selectTime, setSelectedTime] = useState("");
  const [order, setOrder] = useState("ascending");

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

  const getCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories/all", {
       method:"GET",
       credentials: 'include'
      });

      const data = await response.json();

      if (response.ok){
        console.log("Categories fetched: ", data)

        setCategories(data);
      } else {
        console.log("Categories not fetched", data.message);
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
    ? new Date(note.updated_at).toISOString().split('T')[0] === selectTime
    : true;
    console.log("selected time: ", matchTime);
    console.log("updated at times: ", note.updated_at);

    const matchCategory = selectCategory
    ? note.categoryId === Number(selectCategory)
    : true;
    console.log("selected category: ", matchCategory);

    return matchTime && matchTitle && matchCategory;
  });

  useEffect(() => {
    getNotes();  // Call getNotes when component mounts, needs to set to one instance 
    // getCategories();
  }, []); 


  // sorts data ascending or descending based on last updated
  const sortAD = filter.sort((dateOne,dateTwo) => {
    const FirstDate = new Date(dateOne.updated_at);
    const SecondDate = new Date(dateTwo.updated_at);
    return order === "ascending" ? FirstDate - SecondDate : SecondDate - FirstDate;
  });

  // choose between the four states of the notes
  const notesDisplayed = selectCategory || searchTitle || sortAD || selectTime ? filter : notes; 

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
            value={selectCategory}
            onClick={getCategories}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {[...new Set(notes.map(note => note.categoryId))].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select 
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={selectTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Time created</option>
            {[...new Set(notes.map(note => new Date(note.updated_at).toISOString().split('T')[0]))].map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
          <select 
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="ascending" >Time Asc</option>
            <option value="descending" >Time Desc</option>
          </select>
      </div>
      {notesDisplayed.length > 0 ? ( // Applying filtering based on notes
          notesDisplayed.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              date={new Date(note.updated_at).toLocaleString()} // Needs to be fixed 
              ID={note.id}
              category={note.category?.name}
              content={note.content}
              getNotes={getNotes}
            />
          ))
        ) : (
          <p className='text-Black'
          >You have no notes </p>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
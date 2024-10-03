import React from 'react';
import { XCircle } from 'lucide-react';


const NoteCard = ({ title, date, ID, categoryId, content}) => {
  const handleDeleteNote = async () => {
    // Add your delete logic here
    console.log("Note delete button clicked!");
    console.log("ID: ", {ID})

      try {
        const response = await fetch("http://localhost:3000/notes/delete/"+ ID, {
        method:"DELETE",
        credentials: 'include'
        });

        const data = await response.json();

        if (response.ok){
          console.log("Note has been deleted")
        } else {
          console.log("Note has not been deleted", data.message);
        }
          
      } catch (error) {
        console.error(error);
      }
    
  };

  return(
    <div className="bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-DarkestBlue">{title}</h2>
        
        <h3 className="text-xl font-bold text-DarkestBlue">{categoryId}</h3>
        <button className="text-DarkBlue hover:text-DarkestBlue"
          onClick={handleDeleteNote}
        >
          <XCircle size={24} />
        </button>
      </div>
      <p className="text-DarkBlue mb-2">{content}</p>
      <p className="text-DarkBlue text-sm">{date}</p>
    </div>
  );
};

export default NoteCard;
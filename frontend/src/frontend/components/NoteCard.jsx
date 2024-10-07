import React from "react";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/NotesHover.css";

const NoteCard = ({ title, date, id, categoryId, content, getNotes }) => {
  //For editing a note, reroute to Home Page
  const navigate = useNavigate();

  const handleDeleteNote = async (e) => {
    e.stopPropagation(); //Prevent the event from bubbling to the parent div
    console.log("Note delete button clicked!");
    console.log("id: ", { id });

    try {
      const response = await fetch("http://localhost:3000/notes/delete/" + id, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Note has been deleted");
        getNotes(); //Refresh page for remaining notes
      } else {
        console.log("Note has not been deleted", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNoteClick = () => {
    navigate("/notes", {
      state: {
        id,
        title,
        categoryId,
        content,
      },
    });
  };

  return (
    <div
      className="note-card bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md cursor-pointer"
      onClick={handleNoteClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-DarkestBlue">{title}</h2>

        <h3 className="text-xl font-bold text-DarkestBlue">{categoryId}</h3>
        <button
          className="text-DarkBlue hover:text-DarkestBlue"
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

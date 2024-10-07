import React from "react";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/NotesHover.css";

const NoteCard = ({
  title,
  date,
  id,
  categoryId,
  categoryName,
  content,
  getNotes,
}) => {
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
      <div className="flex flex-col mb-2">
        {/* Display the note title with a label and distinct styling */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-gray-600">Title:</span>
          <h2 className="text-2xl font-bold text-DarkestBlue mt-1">{title}</h2>
        </div>

        {/* Display the category name with a label and smaller font size */}
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-600">Category:</span>
          <h3 className="text-lg font-medium text-DarkBlue mt-1">
            {categoryName}
          </h3>
        </div>
      </div>

      {/* Display the note content */}
      <p className="text-DarkBlue mb-2">{content}</p>

      {/* Display the date */}
      <p className="text-DarkBlue text-sm">{date}</p>

      {/* Delete Button */}
      <button
        className="absolute top-2 right-2 text-DarkBlue hover:text-DarkestBlue"
        onClick={handleDeleteNote}
      >
        <XCircle size={24} />
      </button>
    </div>
  );
};
export default NoteCard;
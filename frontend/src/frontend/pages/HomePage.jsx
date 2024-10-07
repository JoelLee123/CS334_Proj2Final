import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard"; // Adjust the import path as necessary
import NoteModal from "../components/NoteModal";
import CategoryModal from "../components/CategoryModal";

const HomePage = ({ setNoteId }) => {
  const [notes, setNotes] = useState([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTitle, setSearch] = useState("");
  const [selectCategory, setSelectedCategory] = useState("");
  const [selectTime, setSelectedTime] = useState("");
  const [order, setOrder] = useState("ascending");
  const navigate = useNavigate();

  // Fetch all notes
  const getNotes = async () => {
    try {
      const response = await fetch("http://localhost:3000/notes/all", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setNotes(data.notes);
      } else {
        console.log("Notes not fetched", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch all categories (for filtering)
  const getCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories/all", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      } else {
        console.log("Categories not fetched", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle note creation through modal
  const handleCreateNote = async (noteData) => {
    try {
      const response = await fetch("http://localhost:3000/notes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: noteData.title,
          content: "", // Default content
          categoryId: noteData.categoryId || 1, // Use selected category or default
        }),
      });

      if (!response.ok) {
        throw new Error("Error creating note");
      }

      const data = await response.json();
      const note = data.note;
      navigate(`/notes`, {
        state: {
          id: note.id,
          title: note.title,
          content: note.content,
          categoryId: note.categoryId,
        },
      });
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleManageCategories = async ({ action, id, name }) => {
    try {
      let response;
      if (action === "add") {
        response = await fetch("http://localhost:3000/categories/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        });
      } else if (action === "edit") {
        response = await fetch(`http://localhost:3000/categories/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        });
      } else if (action === "delete") {
        response = await fetch(
          `http://localhost:3000/categories/delete/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      }

      if (response.ok) {
        getCategories(); // Refresh the categories list
      } else {
        console.error("Error managing category");
      }
    } catch (error) {
      console.error("Error managing category:", error);
    }
  };

  useEffect(() => {
    getNotes();
    getCategories();
  }, []);

  // Apply filtering based on search title, time, and category
  const filter = notes.filter((note) => {
    const matchTitle = searchTitle.trim()
      ? note.title.toLowerCase().includes(searchTitle.toLowerCase())
      : true;

    const matchTime = selectTime
      ? new Date(note.updated_at).toISOString().split("T")[0] === selectTime
      : true;

    const matchCategory = selectCategory
      ? note.categoryId === Number(selectCategory)
      : true;

    return matchTime && matchTitle && matchCategory;
  });

  // Sorting (ascending/descending based on last updated)
  const sortAD = filter.sort((dateOne, dateTwo) => {
    const FirstDate = new Date(dateOne.updated_at);
    const SecondDate = new Date(dateTwo.updated_at);
    return order === "ascending"
      ? FirstDate - SecondDate
      : SecondDate - FirstDate;
  });

  const notesDisplayed =
    selectCategory || searchTitle || sortAD || selectTime ? filter : notes;

  return (
    <div className="bg-LighterBlue min-h-screen p-5">
      <h1 className="text-3xl font-bold text-DarkestBlue text-center mb-8">
        Your Notes
      </h1>

      {/* Create Note and Manage Categories Buttons */}
      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => setIsNoteModalOpen(true)} // Open note modal
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Note
        </button>
        <button
          onClick={() => setIsCategoryModalOpen(true)} // Open category modal
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Manage Categories
        </button>
      </div>

      {/* Filters and Search */}
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
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="border border-DarkestBlue bg-Ivory rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            value={selectTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Time created</option>
            {[
              ...new Set(
                notes.map(
                  (note) =>
                    new Date(note.updated_at).toISOString().split("T")[0]
                )
              ),
            ].map((date) => (
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
            <option value="ascending">Time Asc</option>
            <option value="descending">Time Desc</option>
          </select>
        </div>

        {/* Display Notes */}
        {notesDisplayed.length > 0 ? (
          notesDisplayed.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              date={new Date(note.updated_at).toLocaleString()} // Needs to be fixed
              ID={note.id}
              category={note.categoryId}
              content={note.content}
              getNotes={getNotes}
            />
          ))
        ) : (
          <p className="text-DarkestBlue">
            {notes.length > 0 ? "Loading your notes..." : "No notes available"}
          </p>
        )}
      </div>

      {/* Note Creation Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onCreate={handleCreateNote}
        categories={categories}
      />

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onManageCategories={handleManageCategories}
        categories={categories}
      />
    </div>
  );
};

export default HomePage;
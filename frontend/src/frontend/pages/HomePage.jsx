import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import NoteModal from "../components/NoteModal";
import CategoryModal from "../components/CategoryModal";

const HomePage = ({ setNoteId }) => {
  const [notes, setNotes] = useState([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [Allcategories, setAllCategories] = useState([]);
  const [categoryId] = useState("");
  const [searchTitle, setSearch] = useState("");
  const [selectCategory, setSelectedCategory] = useState("");
  const [selectTime, setSelectedTime] = useState("");
  const [order, setOrder] = useState("ascending");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all notes
  const getNotes = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await fetch("/notes/all", {
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
    } finally {
      setIsLoading(false); // Stop loading once notes are fetched
    }
  };

  // Fetch all categories (for filtering)
  const getCategories = async () => {
    try {
      const response = await fetch("/categories/all", {
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


  const getAllCategories = async () => {
    try {
      const response = await fetch("/categories/allcategories", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setAllCategories(data.Allcategories);
        console.log("All Categories  fetched", data.Allcategories);
      } else {
        console.log("All Categories not fetched", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle note creation through modal
  const handleCreateNote = async (noteData) => {
    try {
      const response = await fetch("/notes/add", {
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
        response = await fetch("/categories/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        });
      } else if (action === "edit") {
        response = await fetch(`/categories/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name }),
        });
      } else if (action === "delete") {
        response = await fetch(
          `/categories/delete/${id}`,
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
    getAllCategories();
  }, [categoryId]);

    // Filter notes based on searchTitle and well as time
    const filter = notes.filter(note => { // changed
      const matchTitle = searchTitle.trim()
      ? note.title.toLowerCase().includes(searchTitle.toLowerCase())
      :true;
  
      const matchTime = selectTime
      ? new Date(note.updated_at).toISOString().split('T')[0] === selectTime
      : true;
  
      const matchCategory = selectCategory
      ? note.categoryId === Number(selectCategory)
      : true;
  
      return matchTime && matchTitle && matchCategory;
    });
  
  

    // sorts data ascending or descending based on last updated
    const sortAD = filter.sort((dateOne,dateTwo) => {
      const FirstDate = new Date(dateOne.updated_at);
      const SecondDate = new Date(dateTwo.updated_at);
      return order === "ascending" ? FirstDate - SecondDate : SecondDate - FirstDate;
    });

    // choose between the four states of the notes
    const notesDisplayed = selectCategory || searchTitle || sortAD || selectTime ? filter : notes; 


return (
    <div
      className="min-h-screen p-5 relative" // Add relative positioning for centering the loader
      style={{
        backgroundImage: "url(/NotesPage.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <img src="/loading.gif" alt="Loading..." className="w-48 h-48" />
        </div>
      )}

      <h1 className="text-3xl font-bold text-black text-center mb-8">
        Your Notes
      </h1>

      {/* Create Note and Manage Categories Buttons */}
      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => setIsNoteModalOpen(true)} // Open note modal
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Create Note
        </button>
        <button
          onClick={() => setIsCategoryModalOpen(true)} // Open category modal
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
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
            onClick={getAllCategories}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {Array.from(new Set(notes.map(note => note.categoryId))) // Get unique categoryIds from notes
              .map((categoryId) => {
                const category = Allcategories.find(cat => cat.id === categoryId); // Find the corresponding category
                return (
                  category && (
                    <option key={categoryId} value={category.id}>
                      {category.name} {/* Display the category name */}
                    </option>
                  )
                );
              })}
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
        {notesDisplayed.length > 0 ? ( // Applying filtering based on notes
          notesDisplayed.map((note, index) => (
            <NoteCard
              key={index}
              title={note.title}
              date={new Date(note.updated_at).toLocaleString()} // Needs to be fixed 
              id={note.id}
              categoryId={note.categoryId}
              category={note.category?.name}
              content={note.content}
              getNotes={getNotes}
            />
          ))
        ) : (
          <p className='text-Black'
          > </p>
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
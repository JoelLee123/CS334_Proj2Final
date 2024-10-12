import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { useLocation } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { useWebSocket } from "./WebSocketContext"; // Import the WebSocket context hook
import { toast, ToastContainer } from "react-toastify";
import DOMPuriry from 'dompurify';
import 'react-toastify/dist/ReactToastify.css';

const NotesPage = () => {
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareError, setShareError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Track the editing state
  const [isSaving, setIsSaving] = useState(false); // Track the saving state
  const [noteStatus, setNoteStatus] = useState("Idle"); // Track the note's status
  const [isCurrentUserEditing, setIsCurrentUserEditing] = useState(false);

  const location = useLocation();

  // Use WebSocket from context
  const socket = useWebSocket();

  // Function to request note status
  const requestNoteStatus = () => {
    if (socket) {
      const noteId = location.state.id;
      socket.send(`getStatus,${noteId}`);
    }
  };
  
  // Request the note's status only once when the page loads
  useEffect(() => {
    requestNoteStatus();
  }, []); // Run only once when the component mounts
  
useEffect(() => {
  if (socket) {
    console.log("WebSocket connection established");

    socket.onmessage = (event) => {
      const message = event.data;
      console.log("WebSocket message received:", message);

      // Check if the message contains 'editing' or 'stopped'
      if (message.includes("started") || message.includes("stopped")) {
        // Re-request the note status to update the UI
        requestNoteStatus();
      }

      if (message.startsWith("status:")) {
          const status = message.replace("status:", "");
          setNoteStatus(status); // Update the note status in the UI
          return;
        }

      toast.info(`${message}`, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket error occurred!");
    };
  }

  return () => {
    if (socket) {
      socket.onmessage = null; // Clean up listener on unmount
    }
  };
}, [socket]);

  useEffect(() => {
    setTitle(location.state?.title || "");
    setMarkdown(location.state?.content || "");
    setCategoryId(location.state?.categoryId || "");
    fetchCategories();
  }, [location.state]);


  const handleMarkdownChange = (e) => {
    setMarkdown(e.target.value);
  };

  const handleShareNote = async () => {
    if (!collaboratorEmail) return setShareError("Please enter an email.");

    try {
      const response = await fetch("http://localhost:3000/collaborators/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: collaboratorEmail,
          noteId: `${location.state.id}`,
        }),
        credentials: "include",
      });

      if (response.status === 404) return setShareError("User not found");
      //if (!response.ok) throw new Error("Error sharing note");

      const data = await response.json();
      if (data.error && data.error.code === "P2002") {
        return setShareError("Collaborator already exists for this note.");
      }
      if (!response.ok) throw new Error("Error sharing note");
      
      setCollaborators([...collaborators, data.newCollaborator]);
      if (socket) {
        socket.send(`notifyNewCollaborator,${location.state.id},${collaboratorEmail}`);
      }
      closeShareModal();

    } catch (error) {
      console.error("Error sharing note:", error);
      setShareError("Error sharing note.");
    }
  };
  const openShareModal = () => setIsShareModalOpen(true);
  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setCollaboratorEmail("");
    setShareError("");
  };

const handleEditNote = () => {
  setNoteStatus("You are editing this note");
  setIsCurrentUserEditing(true); // Set to true when the current user is editing
  // Check if WebSocket is available and note is idle
  if (socket && noteStatus === "Idle") {
    const noteId = location.state.id;

    // Send the editNote command through WebSocket
    socket.send(`editNote,${noteId}`);

    // Set the editing state to true
    setIsEditing(true);
  } else if (isCurrentUserEditing) {
    toast.warn("You are editing this note.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else {
    toast.warn("The note is currently being edited by someone else.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
};

  const handleSave = async (e) => {
    e.preventDefault();

    setIsSaving(true); // Start showing the loading gif

    try {
      const response = await fetch(
        `http://localhost:3000/notes/update/${location.state.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: markdown,
            categoryId: categoryId ? categoryId : 1,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error updating note");
      // Once the note is saved, set isEditing to false to make it read-only
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsSaving(false); // Stop loading
    }
     setIsCurrentUserEditing(false); // Set to false when the current user is done editing
  };

  const handleSaveAndStopEditing = async (e) => {
    e.preventDefault();

    // Trigger the existing save logic
    await handleSave(e);
    setIsCurrentUserEditing(false);// Set to false when the current user stops editing
    setNoteStatus("Idle");

    // Send the WebSocket command to stop editing
    if (socket) {
      const noteId = location.state.id; // Get the note ID
      socket.send(`stopEditing,${noteId}`);
    }
  };


  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories/all", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(
          data.categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))
        );
      } else {
        throw new Error("Invalid categories format");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const renderMarkdown = () => {
    return { __html: DOMPuriry.sanitize(marked(markdown))};
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "note.md";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

    useEffect(() => {
    return () => {
      if (socket && isCurrentUserEditing) {
        const noteId = location.state.id;
        socket.send(`stopEditing,${noteId}`);
        console.log(`Sent stopEditing for note ${noteId}`);
      }
    };
  }, [socket, isCurrentUserEditing, location.state.id]);
  
return (
  <div
    className="min-h-screen p-3 flex flex-col justify-center items-center"
    style={{
      backgroundImage: 'url(/NotesPage.png)',
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
    }}
  >
    <div className="w-full max-w-4xl flex flex-col items-center space-y-6 mt-4 px-4 md:px-8">
      <h1 className="text-2xl md:text-4xl font-bold text-center text-DarkestBlue mb-0">
        Edit Note
      </h1>
      <div className="flex flex-col sm:flex-row sm:space-x-4 items-center w-full">
        <input
          className="border border-DarkestBlue rounded p-2 w-full sm:w-auto flex-1 bg-Ivory focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Add a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditing}
        />
        <select
          className="border border-DarkestBlue rounded p-2 w-full sm:w-auto flex-1 bg-Ivory focus:ring-2 focus:ring-blue-500 mt-2 sm:mt-0"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={!isEditing}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleEditNote}
           className={`bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2 sm:mt-0 ${noteStatus !== "Idle" ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={noteStatus !== "Idle" && noteStatus !== "You are editing this note"} // Disable if noteStatus is not "Idle"
        >
          <FiEdit className="inline-block mr-2" />
          Edit
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
        <button
          onClick={handleDownload}
          className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full sm:w-auto"
        >
          Download
        </button>
        <button
          onClick={openShareModal}
          className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full sm:w-auto"
        >
          Share
        </button>
      </div>

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Share Note</h3>
            <div>
              <label className="block text-lg mb-2" htmlFor="collaboratorEmail">
                Collaborator Email
              </label>
              <input
                id="collaboratorEmail"
                type="email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                placeholder="Enter collaborator's email"
                className="w-full border border-DarkestBlue rounded p-2"
              />
            </div>
            <div className="text-red-500 mt-2">{shareError}</div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={closeShareModal}
              >
                Close
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleShareNote}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display the note's status */}
      <div className="note-status relative flex items-center">
        {/* Display the note's status */}
        <strong>Status:</strong> {noteStatus}

        {/* Show the GIF if the note is being edited (status is not "Idle") */}
        {noteStatus !== "Idle" && (
          <img 
            src="/editing.gif" 
            alt="Editing..." 
            className="w-24 h-24 animate-pulse absolute left-[-110px]"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />
        )}
      </div>

      <textarea
        className="border border-DarkestBlue rounded p-4 bg-Ivory w-full"
        rows="12"
        placeholder="Start typing..."
        value={markdown}
        onChange={handleMarkdownChange}
        disabled={!isEditing}
      />

      {isSaving ? (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="bg-black bg-opacity-50 absolute inset-0"></div>
          <img src="/loading.gif" alt="Saving..." className="z-50" />
        </div>
      ) : (
        <button
          onClick={handleSaveAndStopEditing}
            className={`bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-2 sm:mt-0 ${!isCurrentUserEditing && noteStatus && noteStatus !== "Idle" ? 'opacity-50 cursor-not-allowed' : ''}`}
             disabled={!isCurrentUserEditing && noteStatus !== "Idle"} // Disable if not editing and status is not Idle
        >
          Save
        </button>
      )}

      <div
        className="markdown-preview bg-white border border-DarkestBlue rounded p-4 w-full mt-6"
        dangerouslySetInnerHTML={renderMarkdown()}
      ></div>

      {/* Toast notifications */}
      <ToastContainer />

    </div>
  </div>
);
};

export default NotesPage;

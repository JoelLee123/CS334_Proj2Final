import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { useLocation } from "react-router-dom";

const NotesPage = () => {
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareError, setShareError] = useState("");
  const location = useLocation();
  const socketRef = useRef(null);

  useEffect(() => {
    setTitle(location.state?.title || "");
    setMarkdown(location.state?.content || "");
    setCategoryId(location.state?.categoryId || "");
    fetchCategories();
  }, [location.state]);


  // WebSocket connection
  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket("ws://localhost:3000");

    // Handle WebSocket connection opening
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
    };

    // Handle incoming messages
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "UPDATE_NOTE" && data.id === location.state.id) {
        setMarkdown(data.content);
      }
    };

    // Cleanup: Close WebSocket connection on component unmount
    return () => {
      socketRef.current.close();
    };
  }, [location.state.id]); // Re-run if the note ID changes

  // Send updates via WebSocket
  const handleMarkdownChange = (e) => {
    const newContent = e.target.value;
    setMarkdown(newContent);

    // Prepare message to send
    const socketMessage = {
      type: "UPDATE_NOTE",
      id: location.state.id,
      content: newContent,
    };

    // Send the updated content to the WebSocket server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(socketMessage));
    }
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
      if (!response.ok) throw new Error("Error sharing note");

      const data = await response.json();
      setCollaborators([...collaborators, data.newCollaborator]);
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

  const handleSave = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      console.error("Error updating note:", error);
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
    return { __html: marked(markdown) };
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

  return (
    <div className="bg-LighterBlue min-h-screen p-3 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-6 mt-4">
        <h1 className="text-4xl font-bold text-center text-DarkestBlue mb-0">
          Edit Note
        </h1>
        <div className="flex space-x-4 items-center">
          <input
            className="border border-DarkestBlue rounded p-2 bg-Ivory focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Add a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="border border-DarkestBlue rounded p-2 bg-Ivory focus:ring-2 focus:ring-blue-500"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
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

          {/* Share Button (moved to category button's place) */}
          <button
            onClick={openShareModal}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Share
          </button>
        </div>

        {/* Share Note Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg max-w-lg w-full space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Share Note
              </h2>
              <input
                type="email"
                placeholder="Enter collaborator's email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                className="border border-gray-300 p-3 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {shareError && (
                <p className="text-red-600 mb-4 text-center">{shareError}</p>
              )}
              <div className="flex justify-between space-x-4">
                <button
                  onClick={closeShareModal}
                  className="w-full bg-gray-500 hover:bg-gray-700 text-white py-3 px-6 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareNote}
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white py-3 px-6 rounded"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        <textarea
          value={markdown}
          onChange={handleMarkdownChange}
          rows="12"
          className="w-full p-3 border rounded-lg border-LighterBlue bg-Ivory focus:ring-2 focus:ring-DarkBlue"
          placeholder="Enter Markdown content"
        />

        <h2 className="text-2xl font-semibold text-DarkestBlue">
          Markdown Preview
        </h2>
        <div className="w-full border border-LighterBlue bg-Ivory rounded-lg p-3 markdown-preview min-h-[150px] overflow-auto">
          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
            dangerouslySetInnerHTML={renderMarkdown()}
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleDownload}
            className="bg-black hover:bg-DarkestBlue text-Ivory font-bold py-2 px-4 rounded"
          >
            Download
          </button>
          <button
            onClick={handleSave}
            className="bg-black hover:bg-DarkBlue text-Ivory font-bold py-2 px-4 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;

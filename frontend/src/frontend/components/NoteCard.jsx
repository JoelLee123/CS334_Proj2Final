import React, {useState, useEffect} from "react";
import { XCircle, PlusCircle, MinusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/NotesHover.css";


const NoteCard = ({
  title,
  date,
  id,
  categoryId,
  category,
  content,
  getNotes,
}) => {
  //For editing a note, reroute to Home Page
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    console.log("categoryId received in note card: ", categoryId);
    if (isModalOpen) {
      document.body.classList.add('body-modal-open');
    } else {
      document.body.classList.remove('body-modal-open');
    }

    return () => {
      document.body.classList.remove('body-modal-open');
    };
  }, [isModalOpen]);

  const handleDeleteNote = async (e) => {
    e.stopPropagation(); //Prevent the event from bubbling to the parent div
    console.log("Note delete button clicked!");
    console.log("id: ", { id });

    try {
      const response = await fetch("/notes/delete/" + id, {
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

  const handleCloseModal = (e) => {
    setIsModalOpen(false);
    setSelectedUser('');
    setErrorMessage('');
  };

  const handlePlusButtonClick = (e) => {
    e.stopPropagation();
    setIsAddingCollaborator(true);
    setIsModalOpen(true);
    fetchUsers(); // Fetch users when the modal is opened
  };

  const handleMinusButtonClick = (e) => {
    e.stopPropagation();
    setIsAddingCollaborator(false);
    setIsModalOpen(true);
    fetchCollaborators(); //Fetch collaborators for removal
  };


   //Used by minus button
   const fetchCollaborators = async () => {
    console.log("noteID: "+id);
    try {
      const response = await fetch(`/collaborators/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCollaborators(data.collaborators);
        console.log("collaborators fetched:");
      } else {
        console.error("Error fetching collaborators");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirm = async (e) => {
    if (!selectedUser) return;  // Prevent empty selections
    console.log("selected user: " + selectedUser);
  
    const endpoint = isAddingCollaborator
      ? "/collaborators/add"
      : `/collaborators/remove/${id}/${selectedUser}`; // Construct the URL with parameters
  
    const method = isAddingCollaborator ? "POST" : "DELETE";
  
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: isAddingCollaborator
          ? JSON.stringify({ noteId: id, userEmail: selectedUser })
          : undefined, // No body for DELETE
      });
  
      if (response.ok) {
        if (isAddingCollaborator) {
          const userToAdd = users.find(user => user.email === selectedUser);
          setCollaborators(prev => [...prev, userToAdd]);
        } else {
          setCollaborators(prev => prev.filter(collab => collab.userEmail !== selectedUser));
        }
        handleCloseModal();
        fetchCollaborators(); // Refresh the collaborators list
      } else {
        const errorData = await response.json(); // Get detailed error message
        setErrorMessage(errorData.message || "An error occurred.");
        console.error("Error updating collaborator:", errorData.message);
      }
    } catch (error) {
      setErrorMessage("Error: Unable to update collaborator.");
      console.error(error);
    }
  };
  
  

  // Fetch collaborators for the note
  useEffect(() => {
    fetchCollaborators(); // Fetch collaborators on mount
  }, [id]);



   // Fetch list of users for the dropdown when the modal is opened
   const fetchUsers = async () => {
    try {
      const response = await fetch("/users/", {
        method: "GET",
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        //Exclude users already in collaborator list
        const availableUsers = data.users.filter(
          user => !collaborators.find(collab => collab === user.email)
        );
        setUsers(availableUsers);
      } else {
        handleCloseModal(); // Close modal if there's an error
        console.error("Error fetching users");
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="note-card relative bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md cursor-pointer"
      onClick={handleNoteClick}
    >
      <div className="flex flex-col mb-2">
        {/* Display the note title with a label and distinct styling */}
        <div className="mb-2">
          <span className="text-sm font-semibold text-black">Title:</span>
          <h2 className="text-2xl font-bold text-black mt-1">{title}</h2>
          <div className="absolute top-2 right-2 flex space-x-2">
            <button className="text-black hover:text-DarkestBlue" onClick={handlePlusButtonClick}>
              <PlusCircle size={24} />
            </button>
            <button className="text-black hover:text-DarkestBlue" onClick={handleMinusButtonClick}>
              <MinusCircle size={24} />
            </button>
            <button className="text-red-500 hover:text-DarkestBlue" onClick={(e) => { e.stopPropagation(); handleDeleteNote(e); }}>
              <XCircle size={24} />
            </button>
        </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-black mb-2">Category: {category}</h2>
      <p className="text-black mb-2">{content}</p>
      <p className="text-black text-sm">{date}</p>
  
      <h3 className="text-lg font-bold text-black mb-2">
        Collaborators: {collaborators.length > 0 ? collaborators.map(c => {
          if (c && c.userEmail && c.userEmail.includes('@')) {  
            const username = c.userEmail.match(/^(.*)@/)[1];
            return username;
          }else{
            return c.userEmail
          }
          }).join(', ') : "None"}
      </h3>


      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">
              {isAddingCollaborator ? "Select a Collaborator to Add" : "Select a Collaborator to Remove"}
            </h2>
            <select
              className="mb-4 p-2 border rounded w-full"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="" disabled>Select a user</option>
              {(isAddingCollaborator ? users : collaborators).map(user => (
                 <option key={user.userEmail || user.email} value={user.userEmail || user.email}>
                 {user.userEmail || user.email}
               </option>
              ))}
            </select>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="flex justify-end">
              <button className="mr-2 p-2 bg-gray-300 rounded" onClick={handleCloseModal}>Cancel</button>
              <button className="p-2 bg-blue-500 text-white rounded" onClick={handleConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
export default NoteCard;
import React, { useState, useEffect } from 'react';
import { XCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../css/NotesHover.css';

const NoteCard = ({ title, date, ID, categoryId, category, content, getNotes }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('body-modal-open');
    } else {
      document.body.classList.remove('body-modal-open');
    }

    return () => {
      document.body.classList.remove('body-modal-open');
    };
  }, [isModalOpen]);

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

  const handleCloseModal = (e) => {
    setIsModalOpen(false);
    setSelectedUser('');
    setErrorMessage('');
  };

  const handleDeleteNote = async (e) => {
    e.stopPropagation(); // Prevent the event from bubbling to the parent div

    try {
      const response = await fetch("http://localhost:3000/notes/delete/" + ID, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        getNotes(); // Refresh notes after deletion
      } else {
        console.error("Error deleting note");
      }

    } catch (error) {
      console.error(error);
    }
  };

  // Fetch list of users for the dropdown when the modal is opened
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users/", {
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

  //Used by minus button
  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`http://localhost:3000/collaborators/${ID}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCollaborators(data.collaborators);
      } else {
        console.error("Error fetching collaborators");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirm = async (e) => {
    if (!selectedUser) return;  // Prevent empty selections

    try {
      const endpoint = isAddingCollaborator
        ? "http://localhost:3000/collaborators/add"
        : "http://localhost:3000/collaborators/remove";

      const method = isAddingCollaborator ? "POST" : "DELETE";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          noteId: ID,
          userEmail: selectedUser,
        })
      });

      if (response.ok) {
        if (isAddingCollaborator) {
          const userToAdd = users.find(user => user.email === selectedUser);
          setCollaborators(prev => [...prev, userToAdd]);
        } else {
          setCollaborators(prev => prev.filter(collab => collab.email !== selectedUser));
        }
        handleCloseModal();
        fetchCollaborators(); // Refresh the collaborators list
      } else {
        setErrorMessage("Error: User is already a collaborator or cannot be removed.");
        console.error("Error updating collaborator");
      }
    } catch (error) {
      setErrorMessage("Error: User is already a collaborator or cannot be removed.");
      console.error(error);
    }
  };

  // Fetch collaborators for the note
  useEffect(() => {
    fetchCollaborators(); // Fetch collaborators on mount
  }, [ID]);

  return (
    <div className="note-card bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md cursor-pointer" onClick={() => navigate('/homepage', { state: { title, categoryId, content, ID } })}>
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-xl font-bold text-DarkestBlue">{title}</h1>
        <div className="flex space-x-2">
          <button className="text-black hover:text-DarkestBlue" onClick={handlePlusButtonClick}>
            <PlusCircle size={24} />
          </button>
          <button className="text-black hover:text-DarkestBlue" onClick={handleMinusButtonClick}>
            <MinusCircle size={24} />
          </button>
          <button className="text-DarkBlue hover:text-DarkestBlue" onClick={(e) => { e.stopPropagation(); handleDeleteNote(e); }}>
            <XCircle size={24} />
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-DarkestBlue mb-2">Category: {category}</h2>
      <p className="text-DarkBlue mb-2">{content}</p>
      <p className="text-DarkBlue text-sm">{date}</p>

      <h3 className="text-lg font-bold text-DarkestBlue mb-2">
        Collaborators: {collaborators.length > 0 ? collaborators.map(c => c.username).join(', ') : "None"}
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
                <option key={user.email} value={user.email}>{user.username}</option>
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
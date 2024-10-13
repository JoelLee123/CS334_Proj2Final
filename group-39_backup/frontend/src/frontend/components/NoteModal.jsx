import { useState } from "react";
import PropTypes from "prop-types";

const NoteModal = ({ isOpen, onClose, onCreate, categories }) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = () => {
    onCreate({ title, categoryId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Note</h2>
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 mb-4 w-full"
          type="text"
          placeholder="Enter note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="border border-DarkestBlue bg-Ivory rounded p-2 mb-4 w-full"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="flex justify-between">
          <button onClick={handleSubmit} className="bg-green-500 text-white py-2 px-4 rounded">
            Create Note
          </button>
          <button onClick={onClose} className="bg-red-500 text-white py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

NoteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default NoteModal;
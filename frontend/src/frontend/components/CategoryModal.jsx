import { useState } from "react";
import PropTypes from "prop-types";

const CategoryModal = ({ isOpen, onClose, onManageCategories, categories }) => {
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState(""); // New state for the edit category name
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onManageCategories({ action: "add", name: newCategory });
      setNewCategory(""); // Clear input
    }
  };

  const handleEditCategory = () => {
    if (editCategoryName.trim() && editCategoryId) {
      onManageCategories({
        action: "edit",
        id: editCategoryId,
        name: editCategoryName,
      });
      setEditCategoryName(""); // Clear input after editing
      setEditCategoryId(null); // Reset edit ID
      setShowEditModal(false); // Close edit modal
    }
  };

  const handleDeleteCategory = (id) => {
    onManageCategories({ action: "delete", id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

        {/* New Category Input */}
        <input
          className="border border-DarkestBlue bg-Ivory rounded p-2 mb-4 w-full"
          type="text"
          placeholder="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={handleAddCategory}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Add Category
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>

        <h3 className="mt-4 mb-2">Existing Categories:</h3>
        <ul className="mb-4">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex justify-between items-center mb-2"
            >
              <span>{category.name}</span>
              <div>
                <button
                  onClick={() => {
                    setEditCategoryName(category.name); // Set the name to edit
                    setEditCategoryId(category.id);
                    setShowEditModal(true);
                  }}
                  className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <input
              className="border border-DarkestBlue bg-Ivory rounded p-2 mb-4 w-full"
              type="text"
              value={editCategoryName} // Use the separate state variable for editing
              onChange={(e) => setEditCategoryName(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={handleEditCategory}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Rename
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onManageCategories: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default CategoryModal;
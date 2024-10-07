import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorPopup, setErrorPopup] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setIsEditMode(true);
      setTitle(location.state.title);
      setMarkdown(location.state.content);
      setCategoryId(location.state.categoryId);
    } else {
      setIsEditMode(false);
      setTitle('');
      setMarkdown('');
      setCategoryId('');
    }
    fetchCategories();
  }, [location.state]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories/all", {
        method: "GET",
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();

      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        throw new Error('Invalid categories format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    if (type === 'edit') {
      const selectedCategory = categories.find((cat) => cat.id === parseInt(categoryId))
      setNewCategoryName(selectedCategory ? selectedCategory.name : '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCategoryName('');
  };

  const handleAddCategory = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories/add", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 409) {
          setErrorPopup('Could not add category, category already exists');
        } else {
          throw new Error('Error adding category');
        }
        return;
      }

      const data = await response.json();
      setCategories([...categories, data.category]);
      closeModal();
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorPopup('Error adding category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryId) {
      setErrorPopup('Please select a category to edit');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/categories/update/${categoryId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error updating category');
      }

      const data = await response.json();
      setCategories(categories.map((category) => 
        category.id === parseInt(categoryId) ? data.updatedCategory : category
      ));
      closeModal();
    } catch (error) {
      console.error('Error updating category:', error);
      setErrorPopup('Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryId) {
      setErrorPopup('Please select a category to delete');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/categories/delete/${categoryId}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error deleting category');
      }

      setCategories(categories.filter((category) => category.id !== parseInt(categoryId)));
      setCategoryId('');
      setErrorPopup('');
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorPopup('Error: Category still in use, cannot delete');
    }
  };

  const closeErrorPopup = () => {
    setErrorPopup('');
  };

  const handleChange = (event) => {
    setMarkdown(event.target.value);
  };

  const renderMarkdown = () => {
    return { __html: marked(markdown) };
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'note.md';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = isEditMode ? `http://localhost:3000/notes/update/${location.state.ID}` : 'http://localhost:3000/notes/add';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
       method: method,
       headers:{
         "Content-Type": "application/json"
       },
       body:JSON.stringify({title, content:markdown, categoryId: parseInt(categoryId)}),
       credentials: 'include'
      });

      const data = await response.json();

      if (response.ok){
        navigate('/notes');
      } else {
        console.log("Note not saved", data.message);
      }
        
    } catch (error) {
      setError(isEditMode ? "Error updating note" : "Invalid note");
      console.error(error);
    }
  };

  return (
    <div className="bg-LighterBlue min-h-screen p-3 flex flex-col justify-start items-center">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-6 mt-4">
        <h1 className="text-4xl font-bold text-center text-DarkestBlue mb-0">{isEditMode ? "Edit Note" : "Add Note"}</h1>
        <div className="flex space-x-4 items-center">
          <input 
            className="border border-DarkestBlue rounded p-2 focus:outline-none bg-Ivory focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Add a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select 
            className="border border-DarkestBlue rounded p-2 focus:outline-none bg-Ivory focus:ring-2 focus:ring-blue-500"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => openModal('add')}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => openModal('edit')}>
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteCategory}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">{modalType === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
              <input
                type="text"
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="border border-gray-300 p-2 mb-4 w-full"
              />
              {errorPopup && <p className="text-red-500 mb-4">{errorPopup}</p>}
              <div className="flex justify-end space-x-2">
                <button onClick={closeModal} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  Cancel
                </button>
                <button onClick={modalType === 'add' ? handleAddCategory : handleUpdateCategory} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {errorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
              <p>{errorPopup}</p>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={closeErrorPopup} className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <textarea
          value={markdown}
          onChange={handleChange}
          rows="12"
          className="w-full p-3 border rounded-lg border-LighterBlue focus:outline-none bg-Ivory focus:ring-2 focus:ring-DarkBlue"
          placeholder="Enter Markdown content"
        />

        <h2 className="text-2xl font-semibold text-DarkestBlue">Markdown Preview</h2>
        <div
          className="w-full border border-LighterBlue bg-Ivory rounded-lg p-3 markdown-preview min-h-[150px] overflow-auto"
        >
          <div 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
            dangerouslySetInnerHTML={renderMarkdown()}
          />
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleDownload}
            className="bg-black hover:bg-DarkestBlue text-Ivory font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            Download
          </button>
          <button
            onClick={handleSave}
            className="bg-black hover:bg-DarkBlue text-Ivory font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
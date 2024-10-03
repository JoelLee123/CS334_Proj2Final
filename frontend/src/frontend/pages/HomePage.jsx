import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons'; // Importing icons

const HomePage = () => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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

      //We want the category names to populate the dropdown list
      if (data.categories && Array.isArray(data.categories)) {
        const categoryNames = data.categories.map(category => ({
          id: category.id,
          name: category.name
        }));
        setCategories(categoryNames); //set categories with only id and name
      } else {
        throw new Error('Invalid categories format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
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
    console.log('Save button clicked');

    try {
      const response = await fetch("http://localhost:3000/notes/add", {
       method:"POST",
       headers:{
         "Content-Type": "application/json"
       },
       body:JSON.stringify({title, content:markdown, categoryId}),
       credentials: 'include'
      });

      const data = await response.json();

      if (response.ok){
        console.log("Note saved")
        console.log(data.note['email']);
      } else {
        console.log("Note not saved", data.message);
      }
        
    } catch (error) {
      setError("Invalid note");
      console.error(error);
    }
  };

  return (
    <div className="bg-LighterBlue min-h-screen p-3 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-6 mt-4">
        <h1 className="text-4xl font-bold text-center text-DarkestBlue mb-0">Markdown Notes</h1>
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
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Icon Buttons */}
          <div className="flex space-x-2">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

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

        <div className="flex space-x-4">
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
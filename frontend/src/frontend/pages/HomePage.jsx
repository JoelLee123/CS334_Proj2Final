import React, { useState } from 'react';
import { marked } from 'marked';


const HomePage = () => {
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState(false);

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
    anchor.download = 'note.md'; // need to change the name 
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

      const data = response.json();

      if (response.ok){
        console.log("Note saved")
       
      }else{
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
        <div className="flex space-x-4">
          <input 
            className="border border-DarkestBlue rounded p-2 focus:outline-none bg-Ivory focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Add a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input 
            className="border border-DarkestBlue rounded p-2 focus:outline-none bg-Ivory focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Add a category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)} // need to implement changes to ensure that category names is associated with an id?
          />
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
};

export default HomePage;

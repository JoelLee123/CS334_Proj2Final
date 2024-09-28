import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';

const HomePage = () => {
  const [markdown, setMarkdown] = useState('');

  // Function to handle markdown input change
  const handleChange = (event) => {
    setMarkdown(event.target.value);
  };

  // Render Markdown to HTML
  const renderMarkdown = () => {
    return { __html: marked(markdown) }; // 'marked' converts markdown to HTML
  };

  // Function saves the markdown note to downloads
  const handleSave = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); // Triggers downloading
    anchor.href = url;
    anchor.download = 'note.md'; // For now all will be called note.md but change
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-blue-100 min-h-screen p-5">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Markdown Notes</h1>

      <nav className="flex justify-center space-x-4 mb-4">
        <Link to="/Profile">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Profile
          </button>
        </Link>
        <Link to="/">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Log out
          </button>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto">
        <textarea
          value={markdown}
          onChange={handleChange}
          rows="10"
          className="w-full p-4 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Markdown content"
        />

        <h2 className="text-2xl font-semibold text-gray-700 mt-6">Markdown Preview</h2>
        <div
          className="border border-gray-300 bg-white rounded-lg p-4 mt-2 markdown-preview"
          dangerouslySetInnerHTML={renderMarkdown()}
        />

        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Save markdown note
        </button>
      </div>
    </div>
  );
};

export default HomePage;

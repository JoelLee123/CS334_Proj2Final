import React from 'react';
import { XCircle } from 'lucide-react';

const NoteCard = ({ title, content, date }) => (
  <div className="bg-Ivory rounded-lg shadow-md p-4 mb-4 w-full max-w-md">
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-bold text-DarkestBlue">{title}</h2>
      <button className="text-DarkBlue hover:text-DarkestBlue">
        <XCircle size={24} />
      </button>
    </div>
    <p className="text-DarkBlue mb-2">{content}</p>
    <p className="text-DarkBlue text-sm">{date}</p>
  </div>
);

export default NoteCard;
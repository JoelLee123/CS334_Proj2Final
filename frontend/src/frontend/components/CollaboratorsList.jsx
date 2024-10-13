// frontend/src/frontend/components/CollaboratorsList.jsx

import React from 'react';

const CollaboratorsList = ({ collaborators }) => (
  <div>
    <h2 className="text-2xl font-semibold text-DarkestBlue">
      Collaborators
    </h2>
    {collaborators.length > 0 ? (
      <ul>
        {collaborators.map((collaborator) => (
          <li key={collaborator.id}>{collaborator.name}</li>
        ))}
      </ul>
    ) : (
      <p>No Collaborators</p>
    )}
  </div>
);

export default CollaboratorsList;
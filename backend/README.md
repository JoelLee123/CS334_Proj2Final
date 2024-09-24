*************************************************************************************************
SYSTEM REQUIREMENTS:
*************************************************************************************************
* Node.js version: v18.20.4
* 
*************************************************************************************************

*************************************************************************************************
DEPENDENCIES:
*************************************************************************************************
* Express.js: For building the REST API.
* Prisma: ORM to interact with the PostgreSQL database.
* TypeScript Types: For both Node.js and Express.
*************************************************************************************************

*************************************************************************************************
CURRENT DATA SCHEMA: (still under consideration)
*************************************************************************************************
The _prisma_migrations table is automatically created by Prisma when you use the migration system. It keeps track of all the migrations that have been applied to our database, including their names, timestamps, and whether they were applied successfully. It needs to stay in our database.

-Users: id, username, email, password (hashed), avatar_url, created_at, updated_at.

-Notes: id, title, content (markdown), category_id, created_at, updated_at.

-Categories: id, name, created_at, updated_at.

-Collaborators: note_id, user_id (many-to-many relationship for real-time collaboration).
    The Collaborator model is used to manage and facilitate real-time collaboration on notes in your collaborative note-taking web app. 
    Purpose of the Collaborator Model:
    Many-to-Many Relationships:
    - The Collaborator model serves as a junction table that connects `Users` and `Notes`, allowing multiple users to collaborate on a single note and a single user to work on multiple notes.
    Real-Time Collaboration:
    - It helps track which users are currently collaborating on which notes, enabling features such as displaying the users who are editing a note in real-time.

*************************************************************************************************

*************************************************************************************************
HOW TO USE THE APPLICATION (BACKEND):
*************************************************************************************************
* Ensure that environment variables are configured in a .env file in the backend directory for database connection.

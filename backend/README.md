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

User model:
* id: An integer field that is auto-incremented and serves as the primary key (@id).
* username and email: Both are unique, meaning no two users can have the same username or email.
* password: Stores the user's password.
* avatar_url: An optional string field for storing a user's avatar URL.
* created_at: Automatically stores the time the user was created (@default(now())).
* updated_at: Automatically updates whenever the record is modified (@updatedAt).
* collaborators: Defines a relationship to the Collaborator model, indicating that a user can be associated with multiple collaborations.

Notes model:
* id: Primary key, auto-incremented.
* title: The title of the note.
* content: Stores the content of the note.
* categoryId: This field references a category (Category model).
* category: Establishes a relation between Note and Category using categoryId.
* collaborators: A relation to the Collaborator model to allow multiple users to be associated with a note.
* created_at and updated_at: Similar to the User model, these fields track when the note was created and last updated.

Category model:
* id: Primary key, auto-incremented.
* name: A unique string for the category name, ensuring no two categories have the same name.
* notes: Defines the one-to-many relationship between Category and Note. A category can have multiple notes.
* created_at and updated_at: Track the creation and modification times.

Collaborator model:
* note and user: Establish foreign key relationships between Note and User using noteId and userId, respectively.
* Each combination of noteId and userId is unique, meaning the same user cannot collaborate on the same note more than once.
*************************************************************************************************

*************************************************************************************************
HOW TO USE THE APPLICATION (BACKEND):
*************************************************************************************************
* Ensure that environment variables are configured in a .env file in the backend directory.This is never pushed to git.
* Variables in .env:
-   DATABASE_URL
-   DIRECT_URL
-   SUPABASE_URL
-   SUPABASE_KEY
-   PORT

*****************************************************************************************
TESTING WITH CURL
*****************************************************************************************
Run the server:
* npm run start

YOUR_JWT_TOKEN: Login to get a token

***************************************************************
                    Auth:
***************************************************************
* Registration:

curl -X POST http://localhost:<PORT>/auth/register \
-H "Content-Type: application/json" \
-d '{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_password"
}' | jq '.'

* Login:

curl -X POST http://localhost:<PORT>/auth/login \
-H "Content-Type: application/json" \
-d '{
    "email": "your_email@example.com",
    "password": "your_password"
}' | jq '.'

***************************************************************
                    Category:
***************************************************************
* Add category:

curl -X POST http://localhost:<PORT>/categories/add \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "New Category"
}' | jq '.'

* Get all categories:

curl -X GET http://localhost:<PORT>/categories/all \
-H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.'

***************************************************************
                    Notes:
***************************************************************
* Add a New Note

curl -X POST http://localhost:<PORT>/notes/add \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "My First Note",
  "content": "This is the content of my first note.",
  "categoryId": 1
}' | jq '.'

* Get All Notes for the Authenticated User

curl -X GET http://localhost:<PORT>/notes/all \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq '.'

            Fetch a Specific Note by ID

curl -X GET http://localhost:<PORT>/notes/NOTE_ID \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq '.'

* Update a Note

curl -X PUT http://localhost:<PORT>/notes/update/NOTE_ID \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Updated Note Title",
  "content": "This is the updated content of my note.",
  "categoryId": 1
}' | jq '.'

* Delete a Note

curl -X DELETE http://localhost:<PORT>/notes/delete/NOTE_ID \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq '.'

***************************************************************
                       Collaborators:
***************************************************************
* Add a Collaborator:

curl -X POST http://localhost:<PORT>/collaborators/add \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "noteId": <note_id>,
  "userId": <user_id>
}' | jq '.'

* Remove a Collaborator:

curl -X DELETE http://localhost:<PORT>/collaborators/remove/1/2 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq '.'

                Get Collaborators:

curl -X GET http://localhost:<PORT>/collaborators/<note_id> \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq '.'

//***************************************************************
*************************************************************************************************
## SYSTEM REQUIREMENTS:
*************************************************************************************************
* Node.js version: v18.20.4
* 
*************************************************************************************************

*************************************************************************************************
## DEPENDENCIES:
*************************************************************************************************
* Express.js: For building the REST API.
* Prisma: ORM to interact with the PostgreSQL database.
* TypeScript Types: For both Node.js and Express.
*************************************************************************************************

*************************************************************************************************
## CURRENT DATA SCHEMA: (still under consideration)
*************************************************************************************************
The _prisma_migrations table is automatically created by Prisma when you use the migration system. It keeps track of all the migrations that have been applied to our database, including their names, timestamps, and whether they were applied successfully. It needs to stay in our database.

**User model:**
* id: An integer field that is auto-incremented and serves as the primary key (@id).
* username and email: Both are unique, meaning no two users can have the same username or email.
* password: Stores the user's password.
* avatar_url: An optional string field for storing a user's avatar URL.
* created_at: Automatically stores the time the user was created (@default(now())).
* updated_at: Automatically updates whenever the record is modified (@updatedAt).
* collaborators: Defines a relationship to the Collaborator model, indicating that a user can be associated with multiple collaborations.

**Notes model:**
* id: Primary key, auto-incremented.
* title: The title of the note.
* content: Stores the content of the note.
* categoryId: This field references a category (Category model).
* category: Establishes a relation between Note and Category using categoryId.
* collaborators: A relation to the Collaborator model to allow multiple users to be associated with a note.
* created_at and updated_at: Similar to the User model, these fields track when the note was created and last updated.

**Category model:**
* id: Primary key, auto-incremented.
* name: A unique string for the category name, ensuring no two categories have the same name.
* notes: Defines the one-to-many relationship between Category and Note. A category can have multiple notes.
* created_at and updated_at: Track the creation and modification times.

**Collaborator model:**
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
-   JWT_SECRET

*****************************************************************************************
# TESTING WITH CURL
*****************************************************************************************
* Run the server:
```bash
npm run start
```

YOUR_JWT_TOKEN: Login to get a token

***************************************************************
## Auth:
***************************************************************
* Registration:

```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d '{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_password"
}' | jq '.'
```

* Login:

```bash
curl -c cookies.txt -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{
    "email": "your_email@example.com",
    "password": "your_password",
    "rememberMe": <true> | <false>
}' | jq '.'
```

* Request Reset Password:

```bash
curl -X POST "http://localhost:3000/auth/request-password-reset?email=example@example.com" \
| jq '.'
```

* Reset Passwords:

```bash
curl -X POST "http://localhost:3000/auth/reset-password" \
-H "Content-Type: application/json" \
-d '{"password": "newPassword123", "reset_token": "yourResetTokenHere"}' | jq '.'
```

***************************************************************
## Category:
***************************************************************
* Add category:

```bash
curl -b cookies.txt -X POST http://localhost:3000/categories/add \
-H "Content-Type: application/json" \
-d '{
  "name": "New Category"
}' | jq '.'
```


* Get all categories:

```bash
curl -b cookies.txt -X GET http://localhost:3000/categories/all | jq '.'
```

***************************************************************
## Notes:
***************************************************************
* Add a New Note

```bash
curl -b cookies.txt -X POST http://localhost:3000/notes/add \
-H "Content-Type: application/json" \
-d '{
  "title": "My First Note",
  "content": "This is the content of my first note.",
  "categoryId": 1
}' | jq '.'
```

* Get All Notes for the Authenticated User(no filters)

```bash
curl -b cookies.txt -X GET http://localhost:3000/notes/all | jq '.'
```

* Get All Notes for the Authenticated User(filter by category)

```bash
curl -b cookies.txt -X GET http://localhost:3000/notes/all?categoryID=<category_id> | jq '.'
```

* Get all notes sorted by most recently worked on

```bash
curl -b cookies.txt -X GET "http://localhost:3000/notes/all?sortBy=recent" | jq '.'
```

* Get all notes in a specific category, sorted by most recently worked on:

```bash
curl -b cookies.txt -X GET "http://localhost:3000/notes/all?categoryID=<category_id>&sortBy=recent" | jq '.'
```

* Fetch a Specific Note by ID

```bash
curl -b cookies.txt -X GET http://localhost:3000/notes/NOTE_ID | jq '.'
```

* Update a Note

```bash
curl -b cookies.txt -X PUT http://localhost:3000/notes/update/NOTE_ID \
-H "Content-Type: application/json" \
-d '{
  "title": "Updated Note Title",
  "content": "This is the updated content of my note.",
  "categoryId": 1
}' | jq '.'
```

* Update a Note's status

```bash
curl -b cookies.txt -X PUT http://localhost:3000/notes/update-status/NOTE_ID \
-H "Content-Type: application/json" \
-d '{
  "status": "NEW_STATUS"
}' | jq '.'
```

* Delete a Note

```bash
curl -b cookies.txt -X DELETE http://localhost:3000/notes/delete/NOTE_ID | jq '.'
```

***************************************************************
## Collaborators:
***************************************************************
* Add a Collaborator:

```bash
curl -b cookies.txt -X POST http://localhost:3000/collaborators/add \
-H "Content-Type: application/json" \
-d '{
  "noteId": <note_id>,
  "userEmail": "<user_email>"
}' | jq '.'
```

* Remove a Collaborator:

```bash
curl -b cookies.txt -X DELETE http://localhost:3000/collaborators/remove/1/2  | jq '.'
```

* Get Collaborators:

```bash
curl -b cookies.txt -X GET http://localhost:3000/collaborators/<note_id> | jq '.'
```

***************************************************************
## Users:
***************************************************************
* Get all users:

``` bash
curl -X GET http://localhost:3000/users | jq '.'
```

* Get current authenticated user:

```bash
curl -b cookies.txt -X GET http://localhost:3000/users/me | jq '.'
```

* Update current authenticated user:

```bash
curl -b cookies.txt -X PUT http://localhost:3000/users/me
-H "Content-Type: application/json" \
-d '{
    "username": "your_username",
    "avatar_url": "your_avatar_url"
}' | jq '.'
```

* Delete current authenticated user:

```bash
curl -b cookies.txt -X DELETE http://localhost:3000/users/me | jq '.'
```

* Get all notes for current authenticated user:

```bash
curl -b cookies.txt -X GET http://localhost:3000/users/me/notes | jq '.'
```

* Get user by email:

```bash
curl -X GET http://localhost:3000/users/email | jq '.'
```
***************************************************************
# WebSocket Testing (WebSocket Server Running at ws://localhost:3000)
***************************************************************
Besides adding a status field for a note and providing an endpoint to update a note's status,  only index.ts was modified.

 The server integrates with the existing API for note retrieval, and status updates. A client's websocket session starts with a login(this command can automatically get sent by the UI after a user logs in normally via the API) to authenticate the session, after which users can interact with the notes. Each note has a status that determines if it is available for editing (Idle) or being edited by another user (<username_> is editing this note). The system sends real-time updates to all collaborators connected to the WebSocket.
 For example, if two users are collaborating on a note: User A starts editing the note with editNote,<note_id>. User B receives a message saying, "User A is editing note <note_id>." While User A is busy editing the note, User B can see the status of the note "User A is editing this note". User B will not be able to edit this note while User A is busy editing it. When user A stops editing the note with stopEditing,<note_id> User B receives a message saying, "User A has stopped editing note <note_id>", the note's status changes to Idle, and User B can edit the note.
 The UI will decide what websocket command gets triggered by what buttons. Also, say a user can only have access to the edit button when a note's status is Idle. Furthermore, since each note has a status field that gets updated in real time, this can be displayed on the note(ie. "Idle" or "User A is editing this note").

*****
* Run the server:
```bash
npm run start
```

* Install wscat (if not already installed)

npm install -g wscat

* Connect to WebSocket Server:
```bash
wscat -c ws://localhost:3000
```

* Authenticate the WebSocket Session:
This needs to be sent to the websocket server.This is done to link the session with the user and authenticate the websocket session. If the session is not authenticated, it cannot make API requests.
Upon successful login, the WebSocket server will map the user's email to their WebSocket connection.
```bash
login,<user_email>,<password_>
```

* Start Editing a Note:
Command for starting to edit a note, which will notify connected collaborators.
The server first checks if the note's status is Idle. If Idle, it will update the note's status to "<username_> is editing this note", and notify all collaborators connected via WebSocket that the user has started editing. If not Idle, the WebSocket will send a message to the user informing them that another user is currently editing the note.
```bash
editNote,<note_id>
```
* Stop Editing a Note:
Use this command to indicate that you are done editing a note. The note’s status is updated back to Idle, and all connected collaborators are notified that the user has stopped editing the note.
```bash
stopEditing,<note_id>
```
* Notify a user that you have added them as a collaborator:
```bash
notifyNewCollaborator,<note_id>,<collaboratorEmail>
```

* Open additional clients and repeat the steps to test real-time collaboration

* Disconnect from the WebSocket
CTRL+C (or simply close the terminal)
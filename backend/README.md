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
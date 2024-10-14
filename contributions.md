# Contributions for Project 2: Collaborative Note-taking Web App

**Group Project Due Date**: 14 October, midnight AOE  
**Project Version**: 1.1

---

## External Code Sources

1. **Marked.js Library**  
   - **Source**: [Marked.js Documentation](https://marked.js.org/)  
   - **Description**: We used Marked.js to render markdown in the browser for the note editor.  
   - **Modifications**: Changes were made to allow for real time preview of marked down result.

2. **React Skeleton Example**  
   - **Source**: [React Official Documentation](https://reactjs.org/docs/getting-started.html)  
   - **Description**: Used a basic setup for a React.js app to structure our project.  
   - **Modifications**: Modified the basic structure to suit our application’s note-taking interface, integrated Tailwind CSS for styling.  Updates also had to be to incorporate backend storage facilities to allow for client interactions.

3. **Tailwind CSS**  
   - **Source**: [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation)  
   - **Description**: Used Tailwind CSS for responsive design, styling and accessibility.  
   - **Modifications**: Custom fitted classes to fit the collaborative note-taking interface and guarantee availability.

4. **WebSocket Implementation for Real-Time Collaboration**  
   - **Source**: [Socket.io Documentation](https://socket.io/)  
   - **Description**: Utilized WebSocket to enable real-time updates when users are editing notes concurrently.  
   - **Modifications**: Adjusted the default settings to handle user-specific events such as editing and updating notes in real-time.

5. **NPM packages**  
   - **Source**: NPM Documentation
   - **Description**: Used various npm packages to handle WebSocket communications, authentication, and other utilities.
   - **Modifications**: Adjusted the configurations for real-time collaboration and user interactions within the app.

---

## Code Written by Our Group

- **Authentication System**: Developed a custom authentication system using cookies incorporating JWT tokens for user login and registration. Passwords are hashed for security.
- **Note CRUD Operations**: Our team developed all CRUD operations for notes, including creating, editing, and deleting notes. This includes real-time sync between users via WebSockets.
- **UI Design**: Created the entire front-end interface using React and Tailwind CSS, focusing on user experience, responsive design, and accessibility.
---

## AI-Assisted Code

- **Generative AI Assistance**: We used OpenAI's ChatGPT to help with basic boilerplate code for the WebSocket server and debugging some issues related to authentication.
  - **Specific Contribution**: Generated boilerplate code for setting up Socket.io and initial event listeners for WebSocket communication.
  - **Modifications**: Refined the code to handle specific use cases, such as broadcasting updates to all users editing the same note.

- **Generative AI Assistance**: We used OpenAI's ChatGPT to help back and frontend connectivity.
  - **Specific Contribution**: Generated boilerplate code for setting an initial connection and built the code from that 
  point.
  - **Modifications**: Initial boilerplate provided a single starting point and everything else was a modification.

```   
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, isTicked })
        });
    } catch (error) {
        setError("An error occurred during login. Please try again later.");
    }
```

## AI-Assisted Code

- **Supabase assistence**: https://supabase.com/partners/integrations/prisma
  - **Specific Contribution**: The code below comes from this guide on how to connect Prisma to Supabase
  - **Modifications**: Refined the code to handle specific use cases needed for general setup.
```
    datasource db {
    provider          = "postgresql"
    url               = env("DATABASE_URL")
    directUrl         = env("DIRECT_URL")
    }

    generator client {
    provider = "prisma-client-js"
    }

    model Post {
    id        Int     @id @default(autoincrement())
    title     String
    content   String?
    published Boolean @default(false)
    author    User?   @relation(fields: [authorId], references: [id])
    authorId  Int?
    }

    model User {
    id    Int     @id @default(autoincrement())
    email String  @unique
    name  String?
    posts Post[]
    }
```
---

## Helpful Resources

- **PostgreSQL Normalization**: Followed [PostgreSQL Documentation](https://www.postgresql.org/docs/) for best practices in database normalization to 3NF.
- **JWT Authentication**: Referenced [Auth0 Blog](https://auth0.com/blog/) to understand the distinction between authentication (authn) and authorization (authz).
- **Dotenv for Environment Variables**: Used [Dotenv](https://github.com/motdotla/dotenv) to manage environment variables securely for sensitive data such as database passwords.
- **Creating the initial react-app**: Resource used in [Initial creation](https://react.dev/learn/describing-the-ui) to allow for the app start up
import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import categoryRoutes from "./routes/categories";
import collaboratorRoutes from "./routes/collaborators";
import userRoutes from "./routes/users";
import cors from "cors";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import axios from "axios"; // For making API requests
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import path from 'path';
import dotenv from 'dotenv';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const PORT = process.env.PORT;
const corsOP={
  origin: 'http://localhost:3000', // Allow requests from your frontend
  credentials: true, // Allow cookies to be sent across different origins
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOP));
app.use(express.static(path.join(__dirname, '../build')));

// Authentication routes
app.use("/auth", authRoutes);

// Notes routes
app.use("/notes", notesRoutes); // Mount the notes routes under /notes

//Categories routes
app.use("/categories", categoryRoutes);

//Collaborators routes
app.use("/collaborators", collaboratorRoutes);

app.use("/users", userRoutes);

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Collaborative note-taking app backend");
});

const clients = new Map(); // Store connected clients

// WebSocket connection handler
wss.on("connection", (ws) => {
  // Object to store cookies for this session
  let sessionCookies: string = "";
  let userEmail: string | undefined;
  let username: string | undefined;

  // Listen for messages from the WebSocket client
  ws.on("message", async (message: Object) => {
    console.log(`Received message: ${message}`);

    // Check if message is a string or an object and convert to string if necessary
    const messageString =
      typeof message === "string" ? message : message.toString();

    // Split the message into parts
    const [command, ...params] = messageString.split(",");

    try {
      if (command === "login") {
        const [email, password, rememberMe] = params;
        userEmail = email;

        // Make an API call to login and store cookies for the session
        const response = await client.post(
          `/auth/login`,
          {
            email,
            password,            rememberMe: rememberMe === "true",
          },
          {
            withCredentials: true,
            // Capture cookies from the response
            headers: { Cookie: sessionCookies },
          }
        );

        // Extract cookies from the response headers and store them for later use
        const cookies = response.headers["set-cookie"];
        if (cookies) {
          sessionCookies = cookies.join("; ");
        }

        // Make another request to get the user's info after login
        const userInfoResponse = await axios.get(
          `/users/${email}`,
          {
            headers: { Cookie: sessionCookies }, // Send the session cookies along with the request
          }
        );

        // Extract the username from the user info response
        username = userInfoResponse.data.username;

        // Store the connected client by their email
        clients.set(userEmail, ws);
        console.log("Client connected on webserver");

        ws.send(JSON.stringify(`Logged in as ${username}`));
      } else if (command === "editNote") {
        const [noteId] = params;

        try {
          // Fetch note details, including the current status
          const noteResponse = await axios.get(
            `/notes/${noteId}`,
            {
              withCredentials: true,
              headers: { Cookie: sessionCookies },
            }
          );

          // Extract the note, status, and collaborators from the API response
          const note = noteResponse.data.note;
          const collaborators = note.collaborators.map(
            (collaborator: { userEmail: string }) => collaborator.userEmail
          );

          // Check the note's status
          if (note.status === "Idle") {
            // If the note is idle, update the status to reflect the current user is editing
            const updatedNoteResponse = await axios.put(
              `/notes/update-status/${noteId}`,
              {
                status: `${username} is editing this note`,
              },
              {
                withCredentials: true,
                headers: { Cookie: sessionCookies },
              }
            );

            // Notify connected collaborators that the user has started editing
            collaborators.forEach((collaboratorEmail: string) => {
              const collaboratorWs = clients.get(collaboratorEmail);
              if (collaboratorWs && collaboratorWs !== ws) {
                collaboratorWs.send(
                  JSON.stringify({
                    message: `User ${username} is editing note ${noteId}`,
                  })
                );
              }
            });
          } else {
            // If the note is not idle, notify the user trying to edit
            ws.send(
              JSON.stringify({
                message: `Cannot edit. Note ${noteId} is currently being edited by ${note.status.replace(
                  " is editing this note",
                  ""
                )}.`,
              })
            );
          }
        } catch (error) {
          ws.send(
            JSON.stringify({
              message: "Error retrieving or updating the note status.",
            })
          );
          console.error("Error handling editNote command:", error);
        }
      } else if (command === "stopEditing") {
        const [noteId] = params;

        // Fetch note details
        const noteResponse = await axios.get(
          `/notes/${noteId}`,
          {
            withCredentials: true,
            headers: { Cookie: sessionCookies },
          }
        );

        const note = noteResponse.data.note;
        const collaborators = note.collaborators.map(
          (collaborator: { userEmail: string }) => collaborator.userEmail
        );

        //When a user is done editing, update the status to Idle
        const updatedNoteResponse = await axios.put(
          `/notes/update-status/${noteId}`,
          {
            status: `Idle`,
          },
          {
            withCredentials: true,
            headers: { Cookie: sessionCookies },
          }
        );

        // Notify connected collaborators that the user has stopped editing
        collaborators.forEach((collaboratorEmail: string) => {
          const collaboratorWs = clients.get(collaboratorEmail);
          if (collaboratorWs && collaboratorWs !== ws) {
            collaboratorWs.send(
              JSON.stringify({
                message: `User ${username} has stopped editing note ${noteId}`,
              })
            );
          }
        });
      } else if (command === "notifyNewCollaborator") {
        const [noteId, newCollaboratorEmail] = params;

        try {
          // Notify the new collaborator via WebSocket if they are connected
          const newCollaboratorWs = clients.get(newCollaboratorEmail);
          if (newCollaboratorWs) {
            newCollaboratorWs.send(
              JSON.stringify({
                message: `You have been added as a collaborator to note ${noteId} by ${username}`,
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                message: `User ${newCollaboratorEmail} is not connected.`,
              })
            );
          }
          // Notify the user who issued the notify command that the notification was successful
          ws.send(
            JSON.stringify({
              message: `${newCollaboratorEmail} has been notified.`,
            })
          );
        } catch (error) {
          ws.send(
            JSON.stringify({
              message: `Error notifying ${newCollaboratorEmail}`,
            })
          );
          console.error("Error handling notifyNewCollaborator command:", error);
        }
      } else {
        ws.send(`Command not recognized: ${command}`);
      }
    } catch (error) {
      // Ensure error has a message property
      if (error instanceof Error) {
        ws.send(`Error handling command ${command}: ${error.message}`);
      } else {
        ws.send(`Error handling command ${command}: Unknown error occurred`);
      }
    }
  });

  // When the client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
    if (userEmail) {
      clients.delete(userEmail); // Remove the client from the clients map
      console.log(`Removed ${userEmail} from connected clients`);
    }
  });
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

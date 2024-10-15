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
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";
import dotenv from "dotenv";

// Initialize Prisma Client for database interactions
const prisma = new PrismaClient();

// Initialize a CookieJar to manage cookies for axios requests
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// Initialize an Express application
const app: Application = express();
const server = http.createServer(app);

// Initialize a WebSocketServer
const wss = new WebSocketServer({ server });

// Load environment variables from the .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const PORT = process.env.PORT;

// Configure CORS options to allow requests from the frontend
const corsOP = {
  origin: "http://localhost:3000", // Allow requests from the frontend
  credentials: true, // Allow cookies to be sent across different origins
};

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(cors(corsOP)); // Enable CORS with configured options
app.use(express.static(path.join(__dirname, "../build"))); // Serve static files

// Authentication routes
app.use("/auth", authRoutes);

// Notes routes
app.use("/notes", notesRoutes); // Mount the notes routes under /notes

// Categories routes
app.use("/categories", categoryRoutes);

// Collaborators routes
app.use("/collaborators", collaboratorRoutes);

// User routes
app.use("/users", userRoutes);

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Collaborative note-taking app backend");
});

// Map to store connected WebSocket clients, identified by user email
const clients = new Map();

// WebSocket connection handler
wss.on("connection", (ws) => {
  // Variables for storing session cookies and user details
  let sessionCookies: string = "";
  let userEmail: string | undefined;
  let username: string | undefined;

  // Listen for messages from the WebSocket client
  ws.on("message", async (message: Object) => {
    console.log(`Received message: ${message}`);

    // Convert the message to a string, if necessary
    const messageString = typeof message === "string" ? message : message.toString();

    // Split the message into command and parameters
    const [command, ...params] = messageString.split(",");

    try {
      if (command === "ping") {
        // Respond with "pong" to test connectivity
        ws.send("pong");
      } else if (command === "login") {
        const [email, password, rememberMe] = params;
        userEmail = email;

        // Check if the user exists in the database
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          ws.send("User not found");
          return;
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          ws.send("Incorrect password");
          return;
        }

        username = user.username;

        // Store the connected WebSocket client
        clients.set(userEmail, ws);
        console.log("Client connected on webserver");

        // Send login success message
        ws.send(`Logged in as ${username}`);
      } else if (command === "editNote") {
        const [noteId] = params;

        try {
          // Fetch the note from the database
          const note = await prisma.note.findUnique({
            where: { id: parseInt(noteId) },
            include: { collaborators: true },
          });

          if (!note) {
            ws.send(`Note ${noteId} not found.`);
            return;
          }

          // Extract the collaborators' emails
          const collaborators = note.collaborators.map((collaborator) => collaborator.userEmail);

          // Check if the note is idle
          if (note.status === "Idle") {
            // Update the note's status to indicate that it's being edited
            await prisma.note.update({
              where: { id: parseInt(noteId) },
              data: { status: `${username} is editing this note#${userEmail}` },
            });

            // Notify other collaborators
            collaborators.forEach((collaboratorEmail) => {
              const collaboratorWs = clients.get(collaboratorEmail);
              if (collaboratorWs && collaboratorWs !== ws) {
                collaboratorWs.send(`${username} started editing note ${note.title}`);
              }
            });
          } else {
            // Notify the user if the note is already being edited
            const statusMessage = note.status ? note.status.replace(" is editing this note", "") : "Unknown editor";
            let pureStatus = statusMessage.split("#")[0];
            if (statusMessage.includes(String(userEmail))) {
              pureStatus = "You are editing this note";
              ws.send(pureStatus);
            } else {
              ws.send(`Note ${noteId} is currently being edited by ${pureStatus}.`);
            }
          }
        } catch (error) {
          ws.send("Error retrieving or updating the note status.");
          console.error("Error handling editNote command:", error);
        }
      } else if (command === "stopEditing") {
        const [noteId] = params;

        try {
          // Fetch the note from the database
          const note = await prisma.note.findUnique({
            where: { id: parseInt(noteId) },
            include: { collaborators: true },
          });

          if (!note) {
            ws.send(`Note ${noteId} not found.`);
            return;
          }

          // Extract the collaborators' emails
          const collaborators = note.collaborators.map((collaborator) => collaborator.userEmail);

          // Update the note's status to "Idle"
          await prisma.note.update({ where: { id: parseInt(noteId) }, data: { status: "Idle" } });

          // Notify other collaborators
          collaborators.forEach((collaboratorEmail) => {
            const collaboratorWs = clients.get(collaboratorEmail);
            if (collaboratorWs && collaboratorWs !== ws) {
              collaboratorWs.send(`${username} has stopped editing note ${note.title}`);
            }
          });
        } catch (error) {
          ws.send("Error retrieving or updating the note status.");
          console.error("Error handling stopEditing command:", error);
        }
      } else if (command === "notifyNewCollaborator") {
        const [noteId, newCollaboratorEmail] = params;

        try {
          // Fetch the note from the database
          const note = await prisma.note.findUnique({
            where: { id: parseInt(noteId) },
            include: { collaborators: true },
          });

          if (!note) {
            ws.send(`Note ${noteId} not found.`);
            return;
          }

          // Notify the new collaborator if they are connected
          const newCollaboratorWs = clients.get(newCollaboratorEmail);
          if (newCollaboratorWs) {
            newCollaboratorWs.send(`You have been added as a collaborator to note ${note.title}`);
          }
          ws.send(`${newCollaboratorEmail} has been notified.`);
        } catch (error) {
          ws.send(`Error notifying ${newCollaboratorEmail}`);
          console.error("Error handling notifyNewCollaborator command:", error);
        }
      } else if (command === "getStatus") {
        const [noteId] = params;

        try {
          // Fetch the note's status from the database
          const note = await prisma.note.findUnique({ where: { id: parseInt(noteId) } });

          if (!note) {
            ws.send(`Note ${noteId} not found.`);
            return;
          }

          // Send the note's status to the client
          ws.send(`status:${note.status}`);
        } catch (error) {
          ws.send("Error retrieving note status.");
          console.error("Error handling getStatus command:", error);
        }
      } else {
        // Handle unrecognized commands
        ws.send(`Command not recognized: ${command}`);
      }
    } catch (error) {
      // Error handling with a message
      if (error instanceof Error) {
        ws.send(`Error handling command ${command}: ${error.message}`);
      } else {
        ws.send(`Error handling command ${command}: Unknown error occurred`);
      }
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    if (userEmail) {
      clients.delete(userEmail); // Remove the client from the map
      console.log(`Removed ${userEmail} from connected clients`);
    }
  });
});

// Serve the React app for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

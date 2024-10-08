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
import prisma from "./service/prisma";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

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

// Define the noteRooms structure: A record where each key is a `noteId` and its value is an array of WebSocket connections
interface NoteRooms {
  [noteId: string]: WebSocket[];
}

const noteRooms: NoteRooms = {}; // Example: { "note-123": [ws1, ws2], "note-456": [ws3] }

// Handle WebSocket connection
wss.on("connection", (ws: WebSocket) => {
  let currentNoteId: string | null = null; // Track the current note for each WebSocket connection

  ws.on("message", (message: string) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "joinNote":
        handleJoinNote(ws, parsedMessage.noteId);
        currentNoteId = parsedMessage.noteId; // Store the noteId the client has joined
        break;
      case "editNote":
        handleEditNote(
          parsedMessage.noteId,
          parsedMessage.content
        );
        break;
      case "leaveNote":
        handleLeaveNote(ws, parsedMessage.noteId);
        break;
      case "updateStatus":
        handleUpdateStatus(
          parsedMessage.noteId,
          parsedMessage.status
        );
        break;
      default:
        console.log("Unknown message type");
    }
  });

  // Handle client disconnect
  ws.on("close", () => {
    if (currentNoteId) {
      handleLeaveNote(ws, currentNoteId);
    }
  });
});

// Handle a user joining a specific note
function handleJoinNote(ws: WebSocket, noteId: string): void {
  // Initialize the room if it doesn't exist
  if (!noteRooms[noteId]) {
    noteRooms[noteId] = [];
  }

  // Add the client (WebSocket connection) to the note's room
  noteRooms[noteId].push(ws);
  console.log(`User joined note ${noteId}`);
}

// Handle editing a note (send updates only to clients in the same note room)
function handleEditNote(noteId: string, content: string): void {
  if (!noteRooms[noteId]) return; // No active clients for this note

  // Broadcast to all clients in the same room (same note)
  noteRooms[noteId].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "noteUpdated", noteId, content }));
    }
  });

  updateNoteInDatabase(noteId, content);
}

// Handle a user leaving a note
function handleLeaveNote(ws: WebSocket, noteId: string): void {
  if (!noteRooms[noteId]) return;

  // Remove the client from the room
  noteRooms[noteId] = noteRooms[noteId].filter((client) => client !== ws);

  // If no clients are left in the room, clean up
  if (noteRooms[noteId].length === 0) {
    delete noteRooms[noteId]; // Clean up the room if empty
  }

  console.log(`User left note ${noteId}`);
}

// Handle updating note status (e.g., "In Use", "Idle")
function handleUpdateStatus(noteId: string, status: string): void {
  // Implement your logic to handle status updates (e.g., "In Use", "Idle")
  console.log(`Note ${noteId} status updated to ${status}`);
}

// Update note in the database
async function updateNoteInDatabase(noteId: string, content: string): Promise<void> {
  try {
    await prisma.note.update({
      where: { id: Number(noteId) },
      data: {
        content: content,
        updated_at: new Date(),
      },
    });
    console.log(`Note ${noteId} successfully updated.`);
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    throw new Error(`Unable to update note ${noteId}`);
  }
}
// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
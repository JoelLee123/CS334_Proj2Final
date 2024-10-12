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
import path from 'path';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

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
            if (command === "ping") {
                 ws.send("pong");
            } else if  (command === "login") {
                const [email, password, rememberMe] = params;
                userEmail = email;

                // 1. Check if the user exists in the database
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    ws.send("User not found");
                    return;
                }

                // 2. Verify the password
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) {
                    ws.send("Incorrect password");
                    return;
                }

                username = user.username;

                // 4. Store the connected WebSocket
                clients.set(userEmail, ws);
                console.log("Client connected on webserver");

                // Send success message
                ws.send(`Logged in as ${username}`);
            } else if (command === "editNote") {

                const [noteId] = params;

                try {
                    // 1. Fetch the note from the database
                    const note = await prisma.note.findUnique({
                        where: { id: parseInt(noteId) },
                        include: {
                            collaborators: true, // Fetch collaborators for the note
                        },
                    });

                    if (!note) {
                        ws.send(`Note ${noteId} not found.`);
                        return;
                    }

                    // 2. Extract the collaborators' emails
                    const collaborators = note.collaborators.map(
                        (collaborator) => collaborator.userEmail
                    );

                    // 3. Check if the note is idle (status: 'Idle')
                    if (note.status === "Idle") {
                        // 4. Update the note's status to reflect that the current user is editing
                        await prisma.note.update({
                            where: { id: parseInt(noteId) },
                            data: {
                                status: `${username} is editing this note`,
                            },
                        });

                        // 5. Notify collaborators that the user has started editing
                        collaborators.forEach((collaboratorEmail: string) => {
                            const collaboratorWs = clients.get(collaboratorEmail);
                            if (collaboratorWs && collaboratorWs !== ws) {
                                collaboratorWs.send(`${username} started editing note ${note.title}`);
                            }
                        });
                    } else {
                        // 6. If the note is not idle, notify the user trying to edit
                        const statusMessage = note.status ? note.status.replace(" is editing this note", "") : "Unknown editor";
                        ws.send(`Cannot edit. Note ${noteId} is currently being edited by ${statusMessage}.`);
                    }
                } catch (error) {
                    ws.send("Error retrieving or updating the note status.");
                   
                    console.error("Error handling editNote command:", error);
                }

            } else if (command === "stopEditing") {
                const [noteId] = params;

                try {
                    // 1. Fetch the note from the database
                    const note = await prisma.note.findUnique({
                        where: { id: parseInt(noteId) },
                        include: {
                            collaborators: true, // Fetch collaborators for the note
                        },
                    });

                    if (!note) {
                        ws.send(`Note ${noteId} not found.`);
                        return;
                    }

                    // 2. Extract the collaborators' emails
                    const collaborators = note.collaborators.map(
                        (collaborator) => collaborator.userEmail
                    );

                    // 3. Update the note's status to "Idle" when the user stops editing
                    await prisma.note.update({
                        where: { id: parseInt(noteId) },
                        data: {
                            status: "Idle",
                        },
                    });

                    // 4. Notify connected collaborators that the user has stopped editing
                    collaborators.forEach((collaboratorEmail: string) => {
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
                    // 1. Fetch the note from the database
                    const note = await prisma.note.findUnique({
                        where: { id: parseInt(noteId) },
                        include: {
                            collaborators: true, // Fetch collaborators for the note
                        },
                    });

                    if (!note) {
                        ws.send(`Note ${noteId} not found.`);
                        return;
                    }

                    // Notify the new collaborator via WebSocket if they are connected
                    const newCollaboratorWs = clients.get(newCollaboratorEmail);
                    if (newCollaboratorWs) {
                        newCollaboratorWs.send(`You have been added as a collaborator to note ${note.title}`);
                    } else {
                        ws.send(`User ${newCollaboratorEmail} is not connected.`);
                    }
                    // Notify the user who issued the notify command that the notification was successful
                    ws.send(`${newCollaboratorEmail} has been notified.`);
                } catch (error) {
                    ws.send(`Error notifying ${newCollaboratorEmail}`);
                    console.error("Error handling notifyNewCollaborator command:", error);
                }
            }  else if (command === "getStatus") {
                const [noteId] = params;

                try {
                    // Fetch the note's status from the database
                    const note = await prisma.note.findUnique({
                        where: { id: parseInt(noteId) },
                    });

                    if (!note) {
                        ws.send(`Note ${noteId} not found.`);
                        return;
                    }

                    // Send the note's status back to the WebSocket client
                    ws.send(`status:${note.status}`);
                } catch (error) {
                    ws.send("Error retrieving note status.");
                    console.error("Error handling getStatus command:", error);
                }

            }
            
            else {
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

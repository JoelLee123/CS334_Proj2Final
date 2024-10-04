import express, { Application, Request, Response } from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import categoryRoutes from "./routes/categories";
import collaboratorRoutes from "./routes/collaborators"; 
import userRoutes from "./routes/users"; 
import cors from "cors";
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios'; // For making API requests
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

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
app.use("/notes", notesRoutes);  // Mount the notes routes under /notes

//Categories routes
app.use("/categories", categoryRoutes);

//Collaborators routes
app.use("/collaborators", collaboratorRoutes);

app.use("/users", userRoutes);

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Collaborative note-taking app backend");
});

// Store users editing notes
const editingUsers: { [noteId: string]: Set<WebSocket> } = {};
const clients = new Map(); // Store connected clients

// WebSocket connection handler
wss.on('connection', (ws) => {
    // Object to store cookies for this session
    let sessionCookies: string = '';

    // Listen for messages from the WebSocket client
    ws.on('message', async (message: Object) => {
        console.log(`Received message: ${message}`);

        // Check if message is a string or an object and convert to string if necessary
        const messageString = typeof message === 'string' ? message : message.toString();

        // Split the message into parts
        const [command, ...params] = messageString.split(',');

        try {
            if (command === 'login') {
                const [email, password, rememberMe] = params;

                // Make an API call to login and store cookies for the session
                const response = await client.post(`http://localhost:${PORT}/auth/login`, {
                    email,
                    password,
                    rememberMe: rememberMe === 'true'
                }, {
                    withCredentials: true,
                    // Capture cookies from the response
                    headers: { Cookie: sessionCookies },
                });
                
                // Store the connected client by their email (or unique ID)
                clients.set(email, ws);

                // Send the API response as JSON
                ws.send(JSON.stringify(response.data));

            } else if (command === 'register') {
                const [username, email, password] = params;

                const response = await client.post(`http://localhost:${PORT}/auth/register`, {
                    username,
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true,
                });

                ws.send(JSON.stringify(response.data));

            } else if (command === 'editNote') {
                const [noteId] = params;
                const userEmail = [...clients.keys()].find(key => clients.get(key) === ws); // Find email of the editing user

                // Add the user to the editing list for this note
                if (!editingUsers[noteId]) {
                    editingUsers[noteId] = new Set();
                }
                editingUsers[noteId].add(ws);

                // Notify other users editing the same note
                for (const user of editingUsers[noteId]) {
                    if (user !== ws) {
                        user.send(JSON.stringify({ message: 'User is editing', noteId }));
                    }
                }
                //TODO: only notify those users collaborating on this note.
                
                // Broadcast to all clients (except the one who is editing)
              clients.forEach((clientWs, email) => {
                if (clientWs !== ws) {
                    clientWs.send(JSON.stringify({
                        message: `User ${userEmail} is editing note ${noteId}`
                    }));
                }
              });

            } else if (command === 'stopEditing') {
                const [noteId] = params;

                // Remove the user from the editing list for this note
                if (editingUsers[noteId]) {
                    editingUsers[noteId].delete(ws);
                    if (editingUsers[noteId].size === 0) {
                        delete editingUsers[noteId]; // Cleanup if no one is editing
                    }
                }

            } else if (command === 'fetchNotes') {

                const [categoryID, sortBy] = params;

                // Construct query parameters based on categoryID and sortBy
                const queryParams: any = {};
                if (categoryID) queryParams.categoryID = categoryID;
                if (sortBy) queryParams.sortBy = sortBy;

                // Make an API call to fetch the notes, passing session cookies for authentication
                const response = await client.get(`http://localhost:${PORT}/notes/all`, {
                    params: queryParams,
                    withCredentials: true,
                    headers: { Cookie: sessionCookies }, // Pass stored cookies
                });

                // Send the API response as JSON
                ws.send(JSON.stringify(response.data));
            }else if (command === 'addNote') {

                const [title, content, categoryId] = params;

                const response = await client.post(`http://localhost:${PORT}/notes/add`, {
                    title,
                    content,
                    categoryId: Number(categoryId),
                }, {
                    withCredentials: true,
                    headers: { Cookie: sessionCookies },
                });

                ws.send(JSON.stringify(response.data));

            } else if (command === 'fetchNote') {

                const [noteId] = params;

                const response = await client.get(`http://localhost:${PORT}/notes/${noteId}`, {
                    withCredentials: true,
                    headers: { Cookie: sessionCookies },
                });

                ws.send(JSON.stringify(response.data));

            } else if (command === 'updateNote') {

                const [noteId, title, content, categoryId] = params;

                const response = await client.put(`http://localhost:${PORT}/notes/update/${noteId}`, {
                    title,
                    content,
                    categoryId: Number(categoryId),
                }, {
                    withCredentials: true,
                    headers: { Cookie: sessionCookies },
                });

                // Broadcast updated content to other users editing the note
                if (editingUsers[noteId]) {
                    for (const user of editingUsers[noteId]) {
                        if (user !== ws) {
                            user.send(JSON.stringify({ message: 'Note content updated', noteId, content }));
                        }
                    }
                }

                ws.send(JSON.stringify(response.data));

            } else if (command === 'deleteNote') {

                const [noteId] = params;

                const response = await client.delete(`http://localhost:${PORT}/notes/delete/${noteId}`, {
                    withCredentials: true,
                    headers: { Cookie: sessionCookies },
                });

                ws.send(JSON.stringify(response.data));
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
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express, { Application, Request, Response } from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth";
import { authenticateToken } from './middleware/auth';
import notesRoutes from "./routes/notes";
import categoryRoutes from "./routes/categories";
import collaboratorRoutes from "./routes/collaborators"; 
import userRoutes from "./routes/users"; 
import cors from "cors";

const app: Application = express();
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/auth";

const app: Application = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Collaborative note-taking app backend");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

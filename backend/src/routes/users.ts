import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

/* Get all users */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        collaborators: true, // Include related collaborator data
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

/* Get the current user's information (using token email) */
router.get("/me", authenticateToken, async (req, res) => {
  const { email } = (req as any).user; /* Extract email from token */

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: email },
    });

    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ message: "Error fetching user", error });
  }
});

/* Update the current user's information (using token email) */
router.put("/me", authenticateToken, async (req, res) => {
  const { email } = (req as any).user; /* Extract email from token */
  const { username, avatar_url } = req.body;

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: {
        username,
        avatar_url,
      },
    });

    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error });
  }
});

/* Delete the current user (using token email) */
router.delete("/me", authenticateToken, async (req, res) => {
  const { email } = (req as any).user; /* Extract email from token */

  try {
    const deletedUser = await prisma.user.delete({
      where: { email: email },
    });

    res.status(200).json({ message: "User deleted", deletedUser });
  } catch (error) {
    res.status(400).json({ message: "Error deleting user", error });
  }
});

/* Get all notes the current user is collaborating on (using token email) */
router.get("/me/notes", authenticateToken, async (req, res) => {
  const { email } = (req as any).user; /* Extract email from token */

  try {
    /* Find the user by email first */
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* Find all notes the user is collaborating on */
    const collaborators = await prisma.collaborator.findMany({
      where: { userEmail: user.email },
      include: {
        note: true,
      },
    });

    const notes = collaborators.map((collab) => collab.note);
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes for user", error });
  }
});

/* Get user by email */
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        collaborators: {
          include: {
            note: true, // Include notes the user collaborates on
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

export default router;
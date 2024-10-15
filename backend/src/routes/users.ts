import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

/**
 * Route to get all users in the database.
 * 
 * @route GET /
 * 
 * @returns {Object} 200 - JSON object with the list of users.
 * @returns {Object} 500 - JSON object if there is an error fetching users.
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        collaborators: true,
      },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

/**
 * Route to get the current user's information using the email in the token.
 * 
 * @route GET /me
 * 
 * @returns {Object} 200 - JSON object with the current user's information.
 * @returns {Object} 404 - JSON object if the user is not found.
 */
router.get("/me", authenticateToken, async (req, res) => {
  const { email } = (req as any).user;

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: email },
    });

    console.log({ user });
    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ message: "Error fetching user", error });
  }
});

/**
 * Route to update the current user's information using the email in the token.
 * 
 * @route PUT /me
 * 
 * @param {string} req.body.username - The new username for the user.
 * @param {string} req.body.avatar_url - The new avatar URL for the user.
 * 
 * @returns {Object} 200 - JSON object with the updated user information.
 * @returns {Object} 400 - JSON object if there is an error updating the user.
 */
router.put("/me", authenticateToken, async (req, res) => {
  const { email } = (req as any).user;
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

/**
 * Route to delete the current user using the email in the token.
 * 
 * @route DELETE /me
 * 
 * @returns {Object} 200 - JSON object with success message after the user is deleted.
 * @returns {Object} 400 - JSON object if there is an error deleting the user.
 */
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

/**
 * Route to get all notes the current user is collaborating on using the email in the token.
 * 
 * @route GET /me/notes
 * 
 * @returns {Object} 200 - JSON object with the list of notes the user is collaborating on.
 * @returns {Object} 500 - JSON object if there is an error fetching notes for the user.
 */
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

/**
 * Route to get a specific user by their email.
 * 
 * @route GET /:email
 * 
 * @param {string} req.params.email - The email of the user to be fetched.
 * 
 * @returns {Object} 200 - JSON object with the user details.
 * @returns {Object} 404 - JSON object if the user is not found.
 * @returns {Object} 500 - JSON object if there is an error fetching the user.
 */
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        collaborators: {
          include: {
            note: true,
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

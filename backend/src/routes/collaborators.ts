import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../service/prisma";
const sendgridEmail = require("../service/sendgrid");

const router = Router();

/**
 * Route to add a collaborator to a note.
 * 
 * @route POST /add
 * 
 * @param {number} req.body.noteId - The ID of the note to which the collaborator will be added.
 * @param {string} req.body.userEmail - The email of the user being added as a collaborator.
 * 
 * @returns {Object} 201 - JSON object with success message and the created collaborator details.
 * @returns {Object} 404 - JSON object if the note or user is not found.
 * @returns {Object} 400 - JSON object if there is an error adding the collaborator.
 * 
 * @throws Will return a 404 status code if the note or user is not found.
 */
router.post("/add", authenticateToken, async (req, res) => {
  const { noteId, userEmail } = req.body;
  const sharingUser = (req as any).user;

  try {
    // Verify that the user owns the note
    const note = await prisma.note.findUnique({
      where: { id: Number(noteId) },
      include: {
        collaborators: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Add the collaborator
    const collaborator = await prisma.collaborator.create({
      data: {
        noteId: Number(noteId),
        userEmail: String(userEmail),
      },
    });

    /* Send the collaborator an email detailing the fact that a note has been shared with them */
    sendgridEmail.sendNoteSharedEmail(userEmail, note.title, sharingUser.email);

    return res
      .status(201)
      .json({ message: "Collaborator added", collaborator });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error adding collaborator", error });
  }
});

/**
 * Route to remove a collaborator from a note.
 * 
 * @route DELETE /remove/:noteId/:userEmail
 * 
 * @param {number} req.params.noteId - The ID of the note from which the collaborator will be removed.
 * @param {string} req.params.userEmail - The email of the collaborator to be removed.
 * 
 * @returns {Object} 200 - JSON object with success message when the collaborator is removed.
 * @returns {Object} 404 - JSON object if the note is not found.
 * @returns {Object} 400 - JSON object if there is an error removing the collaborator.
 * 
 * @throws Will return a 404 status code if the note is not found.
 */
router.delete(
  "/remove/:noteId/:userEmail",
  authenticateToken,
  async (req, res) => {
    const { noteId, userEmail } = req.params;
    const user = (req as any).user;

    try {
      // Verify that the user owns the note
      const note = await prisma.note.findUnique({
        where: { id: Number(noteId) },
        include: {
          collaborators: true,
        },
      });

      /* If the note doesn't exist */
      if (!note) return res.status(404).json({ message: "Note not found" });

      // Remove the collaborator
      await prisma.collaborator.deleteMany({
        where: {
          noteId: Number(noteId),
          userEmail: String(userEmail),
        },
      });

      return res.status(200).json({ message: "Collaborator removed" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error removing collaborator", error });
    }
  }
);

/**
 * Route to get all collaborators for a specific note.
 * 
 * @route GET /:noteId
 * 
 * @param {number} req.params.noteId - The ID of the note whose collaborators will be retrieved.
 * 
 * @returns {Object} 200 - JSON object with the list of collaborators.
 * @returns {Object} 400 - JSON object if there is an error fetching the collaborators.
 * 
 * @throws Will return a 400 status code if there is an error fetching the collaborators.
 */
router.get("/:noteId", authenticateToken, async (req, res) => {
  const { noteId } = req.params;

  try {
    const collaborators = await prisma.collaborator.findMany({
      where: { noteId: Number(noteId) },
      include: { user: true },
    });

    return res.status(200).json({ collaborators });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error fetching collaborators", error });
  }
});
  

export default router;
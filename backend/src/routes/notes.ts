import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../service/prisma";

const router = Router();

/**
 * Route to add a new note for the authenticated user.
 * 
 * @route POST /add
 * 
 * @param {string} req.body.title - The title of the note.
 * @param {string} req.body.content - The content of the note.
 * @param {number} req.body.categoryId - The ID of the category for the note.
 * 
 * @returns {Object} 201 - JSON object with the created note.
 * @returns {Object} 400 - JSON object if there is an error creating the note.
 */
router.post("/add", authenticateToken, async (req, res) => {
  const { title, content, categoryId } = req.body;
  const user = (req as any).user;
  console.log("content detail", { title, content, categoryId });
  console.log("User details", { user });

  var categoryIdNum;

  /* Choose the default category if not selected */
  if (categoryId === "") {
    categoryIdNum = 1;
  } else {
    categoryIdNum = Number(categoryId);
  }

  try {
    // Create the note in the database
    const note = await prisma.note.create({
      data: {
        title,
        content,
        categoryId: categoryIdNum,
        collaborators: {
          create: { userEmail: user.email },
        },
      },
    });
    console.log("Note created", { note });
    return res.status(201).json({ message: "Note created", note });
  } catch (error) {
    console.log("Error creating notes");
    return res.status(400).json({ message: "Error creating note", error });
  }
});

/**
 * Route to get all notes for the authenticated user.
 * 
 * @route GET /all
 * 
 * @param {number} req.query.categoryID - The ID of the category to filter notes (optional).
 * @param {string} req.query.sortBy - The sorting criteria for notes (optional).
 * 
 * @returns {Object} 200 - JSON object with the list of notes.
 * @returns {Object} 400 - JSON object if there is an error fetching notes.
 */
router.get("/all", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const categoryId = parseInt(req.query.categoryID as string, 10);
  const sortBy = req.query.sortBy as string;

  try {
    // Build the "where" clause conditionally based on whether categoryID is provided
    const whereClause: any = {
      collaborators: {
        some: {
          userEmail: user.email,
        },
      },
    };

    if (!isNaN(categoryId)) {
      whereClause.categoryId = categoryId; // Add the categoryId filter if provided
    }

    // Build the "orderBy" clause based on the sortBy parameter
    const orderByClause: any = {};

    if (sortBy === "recent") {
      orderByClause.updated_at = "desc"; // Sort by most recently worked on
    }

    // Fetch all notes where the user is a collaborator, optionally filtered by category, and sorted
    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        collaborators: true,
        category: true,
      },
    });

    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching notes", error });
  }
});

/**
 * Route to fetch a specific note by its ID.
 * 
 * @route GET /:id
 * 
 * @param {number} req.params.id - The ID of the note to be fetched.
 * 
 * @returns {Object} 200 - JSON object with the note details.
 * @returns {Object} 404 - JSON object if the note is not found or access is denied.
 * @returns {Object} 500 - JSON object if there is an error fetching the note.
 */
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    // Fetch the note with the given ID, ensuring the user is a collaborator
    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
        collaborators: {
          some: { userEmail: user.email },
        },
      },
      include: {
        collaborators: true,
        category: true,
      },
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found or access denied" });
    }

    return res.status(200).json({ note });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching note", error });
  }
});


/**
 * Route to update a note.
 * 
 * @route PUT /update/:id
 * 
 * @param {number} req.params.id - The ID of the note to be updated.
 * @param {string} req.body.title - The updated title of the note.
 * @param {string} req.body.content - The updated content of the note.
 * @param {number} req.body.categoryId - The updated category ID of the note.
 * 
 * @returns {Object} 200 - JSON object with the updated note.
 * @returns {Object} 404 - JSON object if the note is not found.
 * @returns {Object} 403 - JSON object if the user is unauthorized to update the note.
 * @returns {Object} 400 - JSON object if there is an error updating the note.
 */
router.put("/update/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, categoryId } = req.body;
  const user = (req as any).user;

  console.log(`Attempting to update note with ID: ${id}`);
  console.log("Request body:", { title, content, categoryId });

  try {
    // Verify that the note exists and the user is a collaborator
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
      include: {
        collaborators: true,
      },
    });

    if (!note) {
      console.log(`Note with ID ${id} not found`);
      return res.status(404).json({ message: "Note not found" });
    }

    const isCollaborator = note.collaborators.some(
      (collab) => collab.userEmail === user.email
    );
    if (!isCollaborator) {
      console.log(`User ${user.email} is not a collaborator on note ${id}`);
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);

    console.log("Update data:", updateData);

    // Update the note in the database
    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: updateData,
    });

    console.log("Note updated successfully:", updatedNote);
    return res.status(200).json({ message: "Note updated", updatedNote });
  } catch (error) {
    console.error("Error updating note:", error);
    return res.status(400).json({
      message: "Error updating note",
      error: (error as Error).message,
    });
  }
});

/**
 * Route to update the status of a note.
 * 
 * @route PUT /update-status/:id
 * 
 * @param {number} req.params.id - The ID of the note whose status is to be updated.
 * @param {string} req.body.status - The new status of the note.
 * 
 * @returns {Object} 200 - JSON object with the updated note status.
 * @returns {Object} 403 - JSON object if the user is unauthorized to update the note status.
 * @returns {Object} 404 - JSON object if the note is not found.
 * @returns {Object} 400 - JSON object if there is an error updating the note status.
 */
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = (req as any).user;

  try {
    // Verify that the user is a collaborator on this note
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
      include: {
        collaborators: true,
      },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    const isCollaborator = note.collaborators.some(
      (collab) => collab.userEmail === user.email
    );
    if (!isCollaborator)
      return res.status(403).json({ message: "Unauthorized" });

    // Update the note status in the database
    const updatedNote = await prisma.note.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res
      .status(200)
      .json({ message: "Note status updated", updatedNote });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating note status", error });
  }
});

/**
 * Route to delete a note.
 * 
 * @route DELETE /delete/:id
 * 
 * @param {number} req.params.id - The ID of the note to be deleted.
 * 
 * @returns {Object} 200 - JSON object with success message when the note is deleted.
 * @returns {Object} 404 - JSON object if the note is not found.
 * @returns {Object} 403 - JSON object if the user is unauthorized to delete the note.
 * @returns {Object} 400 - JSON object if there is an error deleting the note.
 */
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    // Verify that the user is a collaborator on this note
    const note = await prisma.note.findUnique({
      where: { id: Number(id) },
      include: {
        collaborators: true,
      },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    const isCollaborator = note.collaborators.some(
      (collab) => collab.userEmail === user.email
    );
    if (!isCollaborator)
      return res.status(403).json({ message: "Unauthorized" });

    // Delete all collaborators for the note
    await prisma.collaborator.deleteMany({
      where: { noteId: Number(id) },
    });

    // Delete the note
    await prisma.note.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Error deleting note", error });
  }
});

export default router;
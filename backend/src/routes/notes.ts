import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../service/prisma';  // Prisma client instance

const router = Router();

// Add a new note
router.post('/add', authenticateToken, async (req, res) => {
    const { title, content, categoryId } = req.body;
    const user = (req as any).user;

    try {
        // Create the note in the database
        const note = await prisma.note.create({
            data: {
                title,
                content,
                categoryId,
                collaborators: {
                    create: { userId: user.id },
                },
            },
        });

        return res.status(201).json({ message: 'Note created', note });
    } catch (error) {
        return res.status(400).json({ message: 'Error creating note', error });
    }
});

// Get all notes for the authenticated user
router.get('/all', authenticateToken, async (req, res) => {
    const user = (req as any).user;

    try {
        // Fetch all notes where the user is a collaborator
        const notes = await prisma.note.findMany({
            where: {
                collaborators: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            include: {
                collaborators: true,
                category: true,
            },
        });

        return res.status(200).json({ notes });
    } catch (error) {
        return res.status(400).json({ message: 'Error fetching notes', error });
    }
});

// Fetching a specific note by ID
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const user = (req as any).user;

    try {
        // Fetch the note with the given ID, ensuring the user is a collaborator
        const note = await prisma.note.findFirst({
            where: {
                id: Number(id),
                collaborators: {
                    some: { userId: user.id },
                },
            },
            include: {
                collaborators: true, // Include collaborators if needed
                category: true,      // Include category information
            },
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found or access denied' });
        }

        return res.status(200).json({ note });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching note', error });
    }
});

// Update a note
router.put('/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;
    const user = (req as any).user;

    try {
        // Verify that the user is a collaborator on this note
        const note = await prisma.note.findUnique({
            where: { id: Number(id) },
            include: {
                collaborators: true,
            },
        });

        if (!note) return res.status(404).json({ message: 'Note not found' });

        const isCollaborator = note.collaborators.some(collab => collab.userId === user.id);
        if (!isCollaborator) return res.status(403).json({ message: 'Unauthorized' });

        // Update the note in the database
        const updatedNote = await prisma.note.update({
            where: { id: Number(id) },
            data: { title, content, categoryId },
        });

        return res.status(200).json({ message: 'Note updated', updatedNote });
    } catch (error) {
        return res.status(400).json({ message: 'Error updating note', error });
    }
});

// Delete a note
router.delete('/delete/:id', authenticateToken, async (req, res) => {
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

        if (!note) return res.status(404).json({ message: 'Note not found' });

        const isCollaborator = note.collaborators.some(collab => collab.userId === user.id);
        if (!isCollaborator) return res.status(403).json({ message: 'Unauthorized' });

        // Delete all collaborators for the note
        await prisma.collaborator.deleteMany({
            where: { noteId: Number(id) },
        });

        // Delete the note
        await prisma.note.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: 'Note deleted' });
    } catch (error) {
        return res.status(400).json({ message: 'Error deleting note', error });
    }
});


export default router;
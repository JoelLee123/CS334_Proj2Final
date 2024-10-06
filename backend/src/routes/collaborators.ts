import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../service/prisma'; // Prisma client instance

const router = Router();

// Add a collaborator to a note
router.post('/add', authenticateToken, async (req, res) => {
    const { noteId, userEmail } = req.body;

    try {
        // Verify that the user owns the note
        const note = await prisma.note.findUnique({
            where: { id: Number(noteId) },
            include: {
                collaborators: true,
            },
        });

        if (!note) return res.status(404).json({ message: 'Note not found' });

        // Add the collaborator
        const collaborator = await prisma.collaborator.create({
            data: {
                noteId: Number(noteId),
                userEmail: String(userEmail),
            },
        });

        return res.status(201).json({ message: 'Collaborator added', collaborator });
    } catch (error) {
        return res.status(400).json({ message: 'Error adding collaborator', error });
    }
});

// Remove a collaborator from a note
router.delete('/remove', authenticateToken, async (req, res) => {
  const { noteId, userEmail } = req.body;
  const user = (req as any).user;

  try {
      // Verify that the user owns the note
      const note = await prisma.note.findUnique({
          where: { id: Number(noteId) },
          include: {
              collaborators: true,
          },
      });

      if (!note) return res.status(404).json({ message: 'Note not found' });

      // Remove the collaborator
      await prisma.collaborator.deleteMany({
          where: {
              noteId: Number(noteId),
              userEmail: String(userEmail),
          },
      });

      return res.status(200).json({ message: 'Collaborator removed' });
  } catch (error) {
      return res.status(400).json({ message: 'Error removing collaborator', error });
  }
});

// Get collaborators for a specific note
router.get("/:noteId", authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  
  try {
    const collaborators = await prisma.collaborator.findMany({
      where: {
        noteId: parseInt(noteId)
      },
      include: {
        user: {
          select: {
            email: true,
            username: true
          }
        }
      }
    });
    
    const formattedCollaborators = collaborators.map(collab => ({
      email: collab.user.email,
      username: collab.user.username
    }));
    
    res.status(200).json({ collaborators: formattedCollaborators });
  } catch (error) {
    res.status(500).json({ message: "Error fetching collaborators", error });
  }
});
  

export default router;

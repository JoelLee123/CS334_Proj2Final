import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../service/prisma';  // Prisma client instance

const router = Router();

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

export default router;
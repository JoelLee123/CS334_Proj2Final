import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../service/prisma'; // Prisma client instance

const router = Router();

// Add a new category
router.post('/add', authenticateToken, async (req, res) => {
    const { name } = req.body;

    try {
        // Create the category in the database
        const category = await prisma.category.create({
            data: {
                name,
            },
        });

        return res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        return res.status(400).json({ message: 'Error creating category', error });
    }
});

// Get all categories
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Fetch all categories from the database
        const categories = await prisma.category.findMany();
        return res.status(200).json({ categories });
    } catch (error) {
        return res.status(400).json({ message: 'Error fetching categories', error });
    }
});

// Get a specific category by ID
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the category with the given ID
        const category = await prisma.category.findUnique({
            where: { id: Number(id) },
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ category });
    } catch (error) {
        return res.status(400).json({ message: 'Error fetching category', error });
    }
});

// Update a category
router.put('/update/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        // Update the category in the database
        const updatedCategory = await prisma.category.update({
            where: { id: Number(id) },
            data: { name },
        });

        return res.status(200).json({ message: 'Category updated', updatedCategory });
    } catch (error) {
        return res.status(400).json({ message: 'Error updating category', error });
    }
});

// Delete a category
router.delete('/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Delete the category from the database
        await prisma.category.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        return res.status(400).json({ message: 'Error deleting category', error });
    }
});

export default router;

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../service/prisma"; // Prisma client instance
import { Prisma } from '@prisma/client';

const router = Router();

router.post("/add", authenticateToken, async (req, res) => {
  const user = (req as any).user; // This is where the authenticated user is obtained
  const { name } = req.body;

  try {
    // Create the category associated with the logged-in user
    const category = await prisma.category.create({
      data: {
        name,
        user_email: user.email, // Associate the category with the user creating it
      },
    });

    return res.status(201).json({ message: "Category created", category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Handle unique constraint violation (e.g., user already has a category with this name)
      return res
        .status(400)
        .json({ message: "Category name already exists for this user" });
    }
    return res.status(400).json({ message: "Error creating category", error });
  }
});

// Get all categories
router.get("/all", authenticateToken, async (req, res) => {
  const user = (req as any).user; // Authenticated user

  try {
    // Fetch categories that belong to the authenticated user
    const categories = await prisma.category.findMany({
      where: {
        user_email: user.email, // Filter categories by the user's email
      },
    });

    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching categories", error });
  }
});

// Get a specific category by ID
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the category with the given ID
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching category", error });
  }
});

router.put("/update/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const user = (req as any).user; // Authenticated user

  try {
    // Ensure the category belongs to the user
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category || category.user_email !== user.email) {
      return res.status(403).json({ message: "Unauthorized to update this category" });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });

    return res.status(200).json({ message: "Category updated", updatedCategory });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "Category name already exists for this user" });
    }
    return res.status(400).json({ message: "Error updating category", error });
  }
});

// Delete a category
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user; // Authenticated user

  try {
    // Ensure the category belongs to the user
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category || category.user_email !== user.email) {
      return res.status(403).json({ message: "Unauthorized to delete this category" });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Error deleting category", error });
  }
});

export default router;

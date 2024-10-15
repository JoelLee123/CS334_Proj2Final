import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import prisma from "../service/prisma";
import { Prisma } from '@prisma/client';

const router = Router();

/**
 * Route to add a new category for the authenticated user.
 * 
 * @route POST /add
 * 
 * @param {string} req.body.name - The name of the new category to be created.
 * 
 * @returns {Object} 201 - JSON object with success message and created category.
 * @returns {Object} 400 - JSON object if the category name already exists or other error occurs.
 * 
 * @throws Will return a 400 status code if category creation fails.
 */
router.post("/add", authenticateToken, async (req, res) => {
  const user = (req as any).user; 
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

/**
 * Route to get all categories created by the authenticated user.
 * 
 * @route GET /all
 * 
 * @returns {Object} 200 - JSON object with list of categories created by the user.
 * @returns {Object} 400 - JSON object if there is an error fetching the categories.
 * 
 * @throws Will return a 400 status code if there is an error fetching categories.
 */
router.get("/all", authenticateToken, async (req, res) => {
  const user = (req as any).user; // Authenticated user

  try {
    // Fetch categories that belong to the authenticated user
    const categories = await prisma.category.findMany({
      where: {
        user_email: user.email,
      },
    });

    console.log("Categories fetched: ", categories);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching categories", error });
  }
});

/**
 * Route to get all categories from the database.
 * 
 * @route GET /allcategories
 * 
 * @returns {Object} 200 - JSON object with list of all categories in the database.
 * @returns {Object} 400 - JSON object if there is an error fetching the categories.
 * 
 * @throws Will return a 400 status code if there is an error fetching categories.
 */
router.get("/allcategories", authenticateToken, async (req, res) => {
  try {
    /* Fetch categories that belong to the authenticated user */
    const categories = await prisma.category.findMany();

    console.log("Categories fetched: ", categories);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(400).json({ message: "Error fetching categories", error });
  }
});

/**
 * Route to get a specific category by its ID.
 * 
 * @route GET /:id
 * 
 * @param {number} req.params.id - The ID of the category to be fetched.
 * 
 * @returns {Object} 200 - JSON object with the category details if found.
 * @returns {Object} 404 - JSON object if the category is not found.
 * @returns {Object} 400 - JSON object if there is an error fetching the category.
 * 
 * @throws Will return a 404 status code if the category is not found.
 */
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

/**
 * Route to update a specific category by its ID.
 * 
 * @route PUT /update/:id
 * 
 * @param {number} req.params.id - The ID of the category to be updated.
 * @param {string} req.body.name - The new name of the category.
 * 
 * @returns {Object} 200 - JSON object with success message and updated category details.
 * @returns {Object} 403 - JSON object if the user is unauthorized to update the category.
 * @returns {Object} 400 - JSON object if there is an error updating the category.
 * 
 * @throws Will return a 403 status code if the user is unauthorized to update the category.
 */
router.put("/update/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const user = (req as any).user; // Authenticated user

  try {
    /* Ensure the category belongs to the user */
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

/**
 * Route to delete a category by its ID.
 * 
 * @route DELETE /delete/:id
 * 
 * @param {number} req.params.id - The ID of the category to be deleted.
 * 
 * @returns {Object} 200 - JSON object with success message if the category is successfully deleted.
 * @returns {Object} 403 - JSON object if the user is unauthorized to delete the category.
 * @returns {Object} 400 - JSON object if there is an error deleting the category.
 * 
 * @throws Will return a 403 status code if the user is unauthorized to delete the category.
 */
router.delete("/delete/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user = (req as any).user;

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

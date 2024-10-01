import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../service/prisma";
import { authenticateToken } from "../middleware/auth";
const sendgridEmail = require('../service/sendgrid');

const router = Router();
const secret = process.env.JWT_SECRET || "your-secret-key";

/* Register Route */
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  /* Hash the password */
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    /* Create the user in the database */
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User registered", user });
  } catch (error) {
    return res.status(400).json({ message: "Error registering user", error });
  }
});

/* Login Route */
router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    /* Find user by email */
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    /* Check if the password is valid */
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid password" });

    /* Set the expiration time based on remember me flag */
    const expiresIn = rememberMe
      ? "3650d"
      : "1h"; /* Remember me set to 10 years */

    /* Convert expiresIn to milliseconds for cookie maxAge */
    const maxAge = rememberMe ? 3650 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;

    /* Generate a JWT token */
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      {
        expiresIn: expiresIn,
      }
    );

    /* Set the token in the cookie header */
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      maxAge: maxAge,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
});

/* Password Reset Route */
router.post("/password-reset", async (req, res) => {
  const email = req.query.email;  // Access the email from query parameters
  try {
    sendgridEmail.sendPasswordResetEmail(email);
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    return res.status(400).json({ message: "Error sending email", error });
  }
});

export default router;
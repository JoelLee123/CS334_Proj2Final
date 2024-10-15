import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../service/prisma";
import { authenticateToken } from "../middleware/auth";
const sendgridEmail = require("../service/sendgrid");
const crypto = require("crypto");

const router = Router();
const secret = process.env.JWT_SECRET || "your-secret-key";

/**
 * Route to handle user registration.
 * 
 * @route POST /register
 * 
 * @param {string} req.body.username - The username of the user to be registered.
 * @param {string} req.body.email - The email of the user to be registered.
 * @param {string} req.body.password - The password of the user to be registered.
 * 
 * @returns {Object} 201 - JSON object with message and user data upon successful registration.
 * @returns {Object} 400 - JSON object with error message if registration fails.
 * 
 * @throws Will return a 400 status code if there is any issue with the user registration process.
 * 
 */
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
    console.log("User registered", user);
    return res.status(201).json({ message: "User registered", user });
  } catch (error) {
    console.log("Error registering user", error);
    return res.status(400).json({ message: "Error registering user", error });
  }
});

/**
 * Route to handle user login.
 * 
 * @route POST /login
 * 
 * @param {string} req.body.email - The email of the user attempting to login.
 * @param {string} req.body.password - The password of the user attempting to login.
 * @param {boolean} req.body.rememberMe - A flag indicating whether the session should last longer ("remember me" feature).
 * 
 * @returns {Object} 200 - JSON object with success message if login is successful.
 * @returns {Object} 401 - JSON object with error message if the password is incorrect.
 * @returns {Object} 404 - JSON object if the user is not found.
 * @returns {Object} 500 - JSON object if there is a server error during login.
 * 
 * @throws Will return an appropriate status code if login fails.

 */
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
    const token = jwt.sign({ email: user.email }, secret, {
      expiresIn: expiresIn,
    });

    /* Set the token in the cookie header */
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
    });
    console.log("Login successful");
    console.log("Token set in cookie:", token);
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
});

/**
 * Route to request password reset for a user.
 * 
 * @route POST /request-password-reset
 * 
 * @param {string} req.query.email - The email of the user requesting the password reset.
 * 
 * @returns {Object} 200 - JSON object with success message if the email is sent.
 * @returns {Object} 404 - JSON object if the user is not found.
 * @returns {Object} 400 - JSON object if there is an error sending the email.
 * 
 * @throws Will return a 404 status code if the user is not found.
 */
router.post("/request-password-reset", async (req, res) => {
  const email = req.query.email?.toString();

  /* Find the user by email */
  const user = await prisma.user.findUnique({
    where: { email },
  });

  /* If the user doesn't exist */
  if (!user) {
    console.log("user not found")
    return res.status(404).json({ message: "User not found" });
  }

  try {
    /* Generate the reset token */
    const passwordResetToken = crypto.randomBytes(32).toString("hex");

    /* Store the token and expiration in the database */
    await prisma.user.update({
      where: { email },
      data: {
        reset_token: passwordResetToken,
        reset_token_expiry: new Date(
          Date.now() + 10 * 60 * 1000
        ) /* Expires in 10 minutes */,
      },
    });

    /* Send the email */
    sendgridEmail.sendPasswordResetEmail(email, passwordResetToken);
    console.log("Password sent successfully");
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.log("Error sending email");
    return res.status(400).json({ message: "Error sending email", error });
  }
});

/**
 * Route to check if the user is authenticated.
 * 
 * @route GET /check-auth
 * 
 * @middleware authenticateToken - Middleware to validate the JWT token.
 * 
 * @returns {Object} 200 - JSON object with message if the token is valid.
 * 
 */
router.get("/check-auth", authenticateToken, (req, res) => {
  const user = (req as any).user;

  return res.status(200).json({ message: "Token is valid", user: user });
});

/**
 * Route to log out the user by clearing the token.
 * 
 * @route POST /logout
 * 
 * @returns {Object} 200 - JSON object with success message after the user logs out and cookies are cleared.
 */
router.post("/logout", (req, res) => {
  const user = (req as any).user;
  res.cookie("token", "", { maxAge: 0 });
  return res.status(200).json({ message: "User Logged out, cookies cleared", user:user });
});


/**
 * Route to reset the user's password using the provided reset token.
 * 
 * @route POST /reset-password
 * 
 * @param {string} req.body.password - The new password to be set.
 * @param {string} req.body.reset_token - The token provided for password reset.
 * 
 * @returns {Object} 200 - JSON object with success message if the password is successfully updated.
 * @returns {Object} 400 - JSON object if there is an error updating the password.
 */
router.post("/reset-password", async (req, res) => {
  const { password, reset_token } = req.body;

  try {
    /* Hash the password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* Update the password */
    const user = await prisma.user.update({
      where: { reset_token },
      data: {
        password: hashedPassword,
        reset_token: null,
      },
    });
    console.log("Password has been successfully updated: "+hashedPassword)
    return res.status(200).json({ message: "Password succesfully updated" });
  } catch (error) {
    console.log("Password has NOT been successfully updated");
    return res.status(400).json({ message: "Error updating password", error });
  }
});

export default router;
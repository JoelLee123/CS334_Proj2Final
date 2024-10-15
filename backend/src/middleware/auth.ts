import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "your-secret-key";

/**
 * Middleware to protect routes by verifying the provided JWT token.
 * 
 * @param {Request} req - The incoming request object, which should contain the token in cookies.
 * @param {Response} res - The outgoing response object used to send back status and error messages.
 * @param {NextFunction} next - The next middleware function in the stack to be called if the token is valid.
 * 
 * @throws Will return a 401 status code with a message if no token is found in the request.
 * @throws Will return a 403 status code with a message if the token is invalid.
 * 
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};
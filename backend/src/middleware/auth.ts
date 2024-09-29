import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to protect routes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    //const token = req.headers['authorization'];
    const authHeader = req.headers['authorization'];

    // Ensure authHeader exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    // Extract the token from the "Bearer <token>" format
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const decoded = jwt.verify(token, secret);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};
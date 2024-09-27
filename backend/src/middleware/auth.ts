import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to protect routes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, secret);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};
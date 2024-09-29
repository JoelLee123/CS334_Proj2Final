import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../service/prisma';

const router = Router();
const secret = process.env.JWT_SECRET || 'your-secret-key';

/* Register Route */
router.post('/register', async (req, res) => {
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

        return res.status(201).json({ message: 'User registered', user });
    } catch (error) {
        return res.status(400).json({ message: 'Error registering user', error });
    }
});

/* Login Route */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        /* Find user by email */
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        /* Check if the password is valid */
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' });

        /* Generate a JWT token */
        const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging in', error });
    }
});

export default router;
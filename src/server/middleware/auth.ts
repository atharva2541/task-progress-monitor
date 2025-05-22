
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        roles: string[];
      };
    }
  }
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded as { id: string; role: string; roles: string[] };
    next();
  });
};

// Middleware to check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};

// Generate JWT token
export const generateToken = (user: { id: string; role: string; roles: string[] }): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
};

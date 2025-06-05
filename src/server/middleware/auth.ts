
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

// JWT secret key - must be set in environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('JWT_SECRET environment variable must be set to a secure random string (minimum 32 characters)');
}

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; roles: string[] };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
    } else {
      res.status(403).json({ error: 'Token verification failed' });
    }
  }
};

// Middleware to check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && !req.user.roles.includes('admin')) {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }

  next();
};

// Generate JWT token with secure settings
export const generateToken = (user: { id: string; role: string; roles: string[] }): string => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role, 
      roles: user.roles 
    }, 
    JWT_SECRET, 
    { 
      expiresIn: '8h', // Reduced from 24h for better security
      issuer: 'audit-tracker',
      audience: 'audit-tracker-users'
    }
  );
};

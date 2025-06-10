
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }
      
      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal validation error'
      });
    }
  };
};

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  );

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim();

export const roleSchema = z.enum(['admin', 'maker', 'checker1', 'checker2'], {
  errorMap: () => ({ message: 'Invalid role' })
});

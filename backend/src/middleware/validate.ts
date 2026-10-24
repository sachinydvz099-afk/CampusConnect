import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.') || 'field';
          formattedErrors[path] = err.message;
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed. Please correct the highlighted fields.',
          errors: formattedErrors,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request payload.',
      });
    }
  };
}

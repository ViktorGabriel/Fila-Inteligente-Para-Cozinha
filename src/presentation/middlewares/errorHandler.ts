import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../core/AppError.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  console.error('Unhandled internal server error:', error);

  res.status(500).json({
    error: 'Internal server error',
  });
}

import type { Request, Response, NextFunction } from 'express';
import type { HttpException } from '../utils/HttpError';
export function errorHandler(err: HttpException, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
  next();
}

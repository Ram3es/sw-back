import { Request, Response, NextFunction } from 'express';

export function originalUrl(req: Request, res: Response, next: NextFunction) {
  req.url = req.originalUrl;
  next();
}

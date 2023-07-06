import { Request, Response, NextFunction } from 'express';

export function originalUrl(req: Request, res: Response, next: NextFunction) {
  console.log(`originalurl middleware`);
  req.url = req.originalUrl;
  next();
}

import { Request, Response, NextFunction } from 'express';

export function continueUrl(req: Request, res: Response, next: NextFunction) {
  const continueUrl = String(req.query.continue);
  if (req.session?.continueUrl) {
    req.query.continue = req.session?.continueUrl;
  }
  if (continueUrl) {
    /// tslint:disable-next-line
    req.session.continueUrl = continueUrl;
  }
  next();
}

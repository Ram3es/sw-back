import { Request, Response, NextFunction } from 'express';

export function continueUrl(req: Request, res: Response, next: NextFunction) {
  console.log(`CONTINUE middleware`);
  const continueUrl = String(req.query.continue);
  console.log(`continueUrl: ${continueUrl}`);
  if (continueUrl) {
    /// tslint:disable-next-line
    req.session.continueUrl = continueUrl;
  }
  next();
}

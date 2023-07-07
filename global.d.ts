declare global {
  declare module 'express-session' {
    interface SessionData {
      continueUrl?: string;
    }
  }
}

declare global {
  declare module 'express-session' {
    interface SessionData {
      continueUrl?: string;
    }
  }

  declare module 'express' {
    interface Request extends Express.Request {
      user: {
        id: string;
        displayName: string;
        _json: {
          steamid: string;
          personaname: string;
          profileurl: string;
          avatar: string;
        };
      };
    }
  }
}

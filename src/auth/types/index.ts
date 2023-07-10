export interface SessionUser {
  id: string;
  displayName: string;
  _json: {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
  };
}

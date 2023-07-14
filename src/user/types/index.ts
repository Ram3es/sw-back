export interface User {
  id?: number;
  steamId: string;
  steamUsername: string;
  avatarUrl: string;
  profileUrl: string;
  payoutOk?: number;
  banned?: number;
  balance?: number;
}
export interface DBUser {
  id?: number;
  steam_id: string;
  steam_username: string;
  avatar_url: string;
  profile_url: string;
  payout_ok: number;
  banned: number;
  balance: number;
}

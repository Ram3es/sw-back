export interface User {
  steamId: string;
  steamUsername: string;
  avatarUrl: string;
  profileUrl: string;
  payoutOk: number;
  banned: number;
  balance: number;
}
export interface DBUser {
  steam_id: string;
  steam_username: string;
  avatar_url: string;
  profile_url: string;
  payout_ok: number;
  banned: number;
  balance: number;
}

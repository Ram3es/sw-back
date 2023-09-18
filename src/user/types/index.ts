export interface UserBillingAddress {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  streetAddress: string;
  streetAddress2?: string | null;
  city: string;
  province?: string | null;
  zip: string;
  country: string;
}

export interface UserCryptoWallet {
  id: number;
  userId: number;
  wallet: string;
  currency: string;
}

export interface UserAccount {
  id: number;
  userId: number;
  accountType: string;
  accountNumber: string;
}

export interface UserItem {
  id: number;
  userId: number;
  assetId: string;
  withdrawn: boolean;
  createdAt: string;
  updatedAt: string;
  transactionId?: string | null;
}

export interface BalanceHistory {
  id: number;
  userId: number;
  prevBalance: number;
  newBalance: number;
  operation: string;
  extra?: string | null;
  date: string;
  createdAt: string;
}

export interface User {
  id: number;
  steamId: string;
  steamUsername: string;
  avatarUrl: string;
  profileUrl: string;
  payout: number;
  banned: number;
  balance: number;
  transactionsTotal: number;
  tradeUrl?: string | null;
  notifications: number;
  active: number;
  email?: string | null;
  createdAt: string;
}

export interface CreateUser {
  steamId: string;
  steamUsername: string;
  avatarUrl: string;
  profileUrl: string;
  payout?: number;
  banned?: number;
  balance?: number;
  transactionsTotal?: number;
  tradeUrl?: string | null;
  notifications?: number;
  active?: number;
  email?: string | null;
}
export interface UserWithIncludes extends User {
  billingAddress: UserBillingAddress;
  cryptoWallets: UserCryptoWallet[];
  accounts: UserAccount[];
}

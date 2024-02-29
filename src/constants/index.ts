export enum ESteamAppId {
  CSGO = '730',
  DOTA2 = '570',
  RUST = '252490',
}

export enum PAYOUT_LIMITS {
  DAILY = 100000,
  MIN = 100,
  MAX = 100000,
}

export const DEFAULT_LOGIN_REDIRECT = '/success-auth';

export const PAGE_LIMIT = 24;

export enum EPaymentOperation {
  PAYIN = 'payin',
  PAYOUT = 'payout',
  REDEEM = 'redeem',
}

export enum EPaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Complete = 'complete',
  Failed = 'failed',
  Refunded = 'refunded',
  Expired = 'expired',
  Denied = 'denied',
  Sent = 'sent',
}

export enum EPaymentMethod {
  Stripe = 'stripe',
  Coinbase = 'coinbase',
  Cashapp = 'cashapp',
  Redeem = 'redeem',
  PayPal = 'paypal',
  Venmo = 'venmo',
  Ethereum = 'ethereum',
}


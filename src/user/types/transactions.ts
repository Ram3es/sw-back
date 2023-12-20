export interface ICreatePayoutTrx {
  id: string;
  method: string;
  amount: number;
  address: string;
  externalUserId: string;
  status: string;
  txid?: string
}

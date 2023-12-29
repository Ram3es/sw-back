export const TRANSACTION_FILTERS = [
  {
    label: 'Type',
    type: 'multiple-choice-filter',
    name: 'type',
    value: [],
    options: [
      {
        label: 'Instant Sell',
        value: 'sell',
        count: 0,
        warning: null,
      },
      {
        label: 'Purchase',
        value: 'buy',
        count: 0,
        warning: null,
      },
      {
        label: 'Withdraw',
        value: 'payout',
        count: 0,
        warning: null,
      },
      {
        label: 'Deposit',
        value: 'payin',
        count: 0,
        warning: null,
      },
      {
        label: 'Prize',
        value: 'prize',
        count: 0,
        warning: null,
      },
    ],
  },
];

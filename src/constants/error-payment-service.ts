export const PAYMENT_ERRORS = {
  redeem: {
    giftcard_not_found: 'Giftcard пot found',
    giftcard_already_redeemed: 'Giftcard has already been redeemed',
    giftcard_update_failed: 'Giftcard update failed',
  },
  payin: {
    payment_method_disabled: 'Payment method used is currently disabled',
    payment_amount_too_high: 'Payment amount too high',
    payment_amount_too_low: 'Payment amount too low',
    stripe_creation_failed:
      'Something happened with stripe api, retry in a little bit',
    coinbase_creation_failed:
      'Something happened with coinbase api, retry in a little bit',
  },
  payout: {
    payment_method_disabled: 'Payment method used is currently disabled',
    payment_amount_too_high: 'Payment amount too high',
    payment_amount_too_low: 'Payment amount too low',
    invalid_address: 'Payment address is invalid',
    paypal_creation_failed:
      'Something happened with paypal api, retry in a little bit',
    ethereum_creation_failed:
      'something happened with ethereum api, retry in a little bit',
  },
};

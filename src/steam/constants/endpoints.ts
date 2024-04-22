export const ENDPOINTS = new Map();

ENDPOINTS.set('make-trade', {
  url: 'steam/setup-trades',
  method: 'POST',
});
ENDPOINTS.set('create-trade', {
  url: 'steam/account/:steamId/trade',
  method: 'POST',
});
ENDPOINTS.set('get-tradehold', {
  url: 'steam/trade-hold-durations',
  method: 'GET',
});
ENDPOINTS.set('get-inventory', {
  url: 'steam/inventory',
  method: 'GET',
});
ENDPOINTS.set('get-bot-account', {
  url: 'steam/account',
  method: 'GET',
});
ENDPOINTS.set('validate-inventory', {
  url: 'steam/inventory/validate',
  method: 'POST',
});

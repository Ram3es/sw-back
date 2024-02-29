export const ENDPOINTS = new Map();

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

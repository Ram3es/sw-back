import * as steamItems from './steam-items.json';

export const mockSteamItems = (steamId: string, appid: string) => {
  console.log('steamId', steamId);
  console.log('steamId', appid);
  return steamItems;
};

import steamItems from './steam-items.json';

export const mockSteamItems = (steamId: string, appid: string) => {
  console.log('steamId', steamId);
  return steamItems.filter((item) => item.appid === appid);
};

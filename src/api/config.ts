import Constants from 'expo-constants';

const env = (Constants.expoConfig?.extra ?? {}) as {
  SHEETS_BASE_URL?: string;
  SHEETS_API_KEY?: string;
};

export const SHEETS_BASE_URL = env.SHEETS_BASE_URL ?? 'http://localhost:8080';
export const SHEETS_API_KEY = env.SHEETS_API_KEY ?? '';











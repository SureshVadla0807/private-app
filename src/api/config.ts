import { Platform } from 'react-native';
import Constants from 'expo-constants';

const hostUri = Constants?.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
const detectedIp = hostUri ? hostUri.split(':')[0] : '192.168.1.20';

export const API_BASE_URL = Platform.select({
  web: 'http://localhost:5000',
  default: `http://${detectedIp}:5000`,
});

export const TRANSACTIONS_API = `${API_BASE_URL}/api/v1/transactions`;

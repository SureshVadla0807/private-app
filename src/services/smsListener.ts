import { Platform, PermissionsAndroid } from 'react-native';

export interface SMSMessage {
  address: string;    // Sender ID e.g. "CHASE", "HDFCBK", "AMEX"
  body: string;       // SMS text content
  date: number;       // Unix timestamp ms
}

import { TRANSACTIONS_API } from '../api/config';

export class SMSListenerService {
  private static backendApiUrl = TRANSACTIONS_API;

  /**
   * Request user permission for SMS reading (Android only)
   */
  public static async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('SMS reading is not supported on iOS due to Apple sandboxing.');
      return false;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ]);

      const isGranted =
        granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;

      return isGranted;
    } catch (err) {
      console.error('Error requesting SMS permissions:', err);
      return false;
    }
  }

  /**
   * Ingest a captured SMS into the backend API
   */
  public static async sendToBackend(sms: { sender: string; body: string; timestamp?: string }) {
    try {
      const response = await fetch(`${this.backendApiUrl}/ingest/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: sms.body,
          sender: sms.sender,
          timestamp: sms.timestamp || new Date().toISOString(),
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('Failed to send SMS to backend:', err);
      return null;
    }
  }

  /**
   * Ingest a batch of historical SMS messages during first app setup
   */
  public static async sendBatchToBackend(messages: Array<{ sender: string; body: string; timestamp?: string }>) {
    try {
      const response = await fetch(`${this.backendApiUrl}/ingest/batch-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      return await response.json();
    } catch (err) {
      console.error('Failed to send batch SMS to backend:', err);
      return null;
    }
  }

  /**
   * Start listening for incoming SMS messages via Android Native BroadcastReceiver
   */
  public static startListening(onMessageReceived: (message: { sender: string; body: string }) => void) {
    if (Platform.OS !== 'android') return;

    console.log('[SMSListener] Native Android SMS BroadcastReceiver registered.');
    // In production React Native app, hook into native module:
    // DeviceEventEmitter.addListener('SMS_RECEIVED', (sms) => {
    //   this.sendToBackend({ sender: sms.originatingAddress, body: sms.body });
    //   onMessageReceived({ sender: sms.originatingAddress, body: sms.body });
    // });
  }
}

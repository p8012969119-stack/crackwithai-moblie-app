import { NativeEventEmitter, NativeModules, Platform, PermissionsAndroid, Alert } from 'react-native';

export interface SpeechResult {
  text?: string;
  final?: boolean;
  error?: string;
  code?: string;
}

const module = NativeModules.SpeechModule;

export const speechRecognition = {
  get available(): boolean {
    return typeof module?.startRecognition === 'function';
  },

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (check) return true;

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'CrackWithAI needs microphone access to listen to your voice and type it into the input bar.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('[speechRecognition] permission request error:', err);
        return false;
      }
    }
    return true;
  },

  subscribe(listener: (event: SpeechResult) => void) {
    if (!this.available) return { remove() {} };
    try {
      const emitter = new NativeEventEmitter(module);
      return emitter.addListener('SpeechRecognition', listener);
    } catch (e) {
      console.warn('[speechRecognition] emitter subscription error:', e);
      return { remove() {} };
    }
  },

  async start(locale = 'en-US'): Promise<boolean> {
    if (!this.available) {
      Alert.alert(
        'Voice Input Unavailable',
        'Speech recognition module is not available in this environment. Please type in the input bar.'
      );
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone permission is required to listen to your voice. Please allow microphone access in Settings.'
      );
      return false;
    }

    try {
      await module.startRecognition(locale);
      return true;
    } catch (err: any) {
      console.warn('[speechRecognition] startRecognition error:', err?.message || err);
      Alert.alert('Voice Input Error', err?.message || 'Could not start speech recognition.');
      return false;
    }
  },

  stop() {
    try {
      module?.stopRecognition?.();
    } catch (e) {
      // Ignore
    }
  },

  cancel() {
    try {
      module?.cancelRecognition?.();
    } catch (e) {
      // Ignore
    }
  },
};

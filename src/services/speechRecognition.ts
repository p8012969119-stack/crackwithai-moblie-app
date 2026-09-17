import {NativeEventEmitter, NativeModules, Platform} from 'react-native';
export interface SpeechResult {text?: string; final?: boolean; error?: string; code?: string}
const module = NativeModules.SpeechModule;
export const speechRecognition = {
  available: Platform.OS === 'ios' && typeof module?.startRecognition === 'function',
  subscribe(listener: (event: SpeechResult) => void) {
    if (!this.available) return {remove() {}};
    return new NativeEventEmitter(module).addListener('SpeechRecognition', listener);
  },
  async start(locale = 'en-US') {
    if (!this.available) throw new Error('Voice input is unavailable in this build. Rebuild the iOS app, or type your message.');
    await module.startRecognition(locale);
  },
  stop() {module?.stopRecognition?.();},
  cancel() {module?.cancelRecognition?.();},
};

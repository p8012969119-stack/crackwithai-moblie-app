import { Alert, Share, NativeModules, TurboModuleRegistry } from 'react-native';

const isNativeClipboardAvailable = (): boolean => {
  try {
    if (NativeModules && NativeModules.RNCClipboard) {
      return true;
    }
    if (TurboModuleRegistry && typeof TurboModuleRegistry.get === 'function') {
      const mod = TurboModuleRegistry.get('RNCClipboard');
      if (mod) return true;
    }
  } catch (e) {
    // Ignore error
  }
  return false;
};

export const copyToClipboard = (text: string, label: string = 'Content', silent: boolean = false): boolean => {
  if (!text) return false;

  let copied = false;

  if (isNativeClipboardAvailable()) {
    try {
      const clipboard = require('@react-native-clipboard/clipboard');
      const Clipboard = clipboard.default || clipboard;
      if (Clipboard && typeof Clipboard.setString === 'function') {
        Clipboard.setString(text);
        copied = true;
      }
    } catch (err) {
      console.warn('[Clipboard] setString execution error:', err);
    }
  }

  if (!copied) {
    try {
      Share.share({ message: text });
      copied = true;
    } catch (shareErr) {
      console.warn('[Clipboard] Share fallback error:', shareErr);
    }
  }

  if (!silent) {
    Alert.alert(
      `${label} Copied!`,
      `The ${label.toLowerCase()} content has been copied to your clipboard successfully.`
    );
  }

  return true;
};




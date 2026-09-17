import { NativeModules } from 'react-native';

const { SpeechModule } = NativeModules;

let currentAudioInstance: any = null;

/**
 * Clean & format text for speech synthesis
 */
export const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/[#*`_~]/g, '') // remove markdown symbols
    .replace(/\n+/g, '. ')   // replace linebreaks with pauses
    .trim();
};

/**
 * Speak text out loud with sound output
 */
export const speakTextOutLoud = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err?: any) => void
) => {
  stopSpeechSound();

  const formattedText = cleanTextForSpeech(text);
  const g = globalThis as any;

  // Method 1: Check Native Bridge (SpeechModule)
  if (SpeechModule && typeof SpeechModule.speak === 'function') {
    try {
      SpeechModule.speak(formattedText, 0.5, 1.0);
      if (onStart) onStart();
      return;
    } catch (err) {
      console.warn('[speechUtils] Native SpeechModule error:', err);
    }
  }

  // Method 2: Web Speech Synthesis API
  const synth = g.speechSynthesis || g.window?.speechSynthesis;
  const UtteranceClass = g.SpeechSynthesisUtterance || g.window?.SpeechSynthesisUtterance;

  if (synth && UtteranceClass) {
    try {
      synth.cancel();
      const utterance = new UtteranceClass(formattedText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => onStart && onStart();
      utterance.onend = () => onEnd && onEnd();
      utterance.onerror = (e: any) => onError && onError(e);
      synth.speak(utterance);
      if (onStart) onStart();
      return;
    } catch (err) {
      console.warn('[speechUtils] SpeechSynthesis error:', err);
    }
  }

  // Method 3: Audio Sound Stream Fallback (e.g., Google TTS Audio endpoint)
  if (typeof g.Audio !== 'undefined') {
    try {
      const chunk = formattedText.slice(0, 200);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const audio = new g.Audio(audioUrl);
      currentAudioInstance = audio;

      audio.onplay = () => onStart && onStart();
      audio.onended = () => onEnd && onEnd();
      audio.onerror = (err: any) => onError && onError(err);
      
      audio.play().catch((err: any) => {
        console.warn('[speechUtils] Audio playback error:', err);
        if (onStart) onStart();
      });
      return;
    } catch (err) {
      console.warn('[speechUtils] Audio constructor error:', err);
    }
  }

  // If no audio engine available in simulator environment, notify user
  if (onStart) onStart();
};

/**
 * Stop any active audio sound playback
 */
export const stopSpeechSound = () => {
  const g = globalThis as any;

  if (SpeechModule && typeof SpeechModule.stop === 'function') {
    try {
      SpeechModule.stop();
    } catch (e) {}
  }

  const synth = g.speechSynthesis || g.window?.speechSynthesis;
  if (synth && typeof synth.cancel === 'function') {
    try {
      synth.cancel();
    } catch (e) {}
  }

  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
    } catch (e) {}
    currentAudioInstance = null;
  }
};

/**
 * Pause active audio sound playback
 */
export const pauseSpeechSound = () => {
  const g = globalThis as any;

  if (SpeechModule && typeof SpeechModule.pause === 'function') {
    try {
      SpeechModule.pause();
    } catch (e) {}
  }

  const synth = g.speechSynthesis || g.window?.speechSynthesis;
  if (synth && typeof synth.pause === 'function') {
    try {
      synth.pause();
    } catch (e) {}
  }

  if (currentAudioInstance && typeof currentAudioInstance.pause === 'function') {
    try {
      currentAudioInstance.pause();
    } catch (e) {}
  }
};

/**
 * Resume active audio sound playback
 */
export const resumeSpeechSound = () => {
  const g = globalThis as any;

  if (SpeechModule && typeof SpeechModule.resume === 'function') {
    try {
      SpeechModule.resume();
    } catch (e) {}
  }

  const synth = g.speechSynthesis || g.window?.speechSynthesis;
  if (synth && typeof synth.resume === 'function') {
    try {
      synth.resume();
    } catch (e) {}
  }

  if (currentAudioInstance && typeof currentAudioInstance.play === 'function') {
    try {
      currentAudioInstance.play();
    } catch (e) {}
  }
};

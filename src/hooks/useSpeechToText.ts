import { useState, useEffect, useRef, useCallback } from 'react';
import { speechRecognition, SpeechResult } from '../services/speechRecognition';

export interface UseSpeechToTextOptions {
  onTextReceived: (fullText: string) => void;
  getCurrentText: () => string;
  locale?: string;
}

export function useSpeechToText({ onTextReceived, getCurrentText, locale = 'en-US' }: UseSpeechToTextOptions) {
  const [isListening, setIsListening] = useState(false);
  const baseTextRef = useRef('');
  const isListeningRef = useRef(false);

  useEffect(() => {
    const sub = speechRecognition.subscribe((event: SpeechResult) => {
      if (!isListeningRef.current) return;

      if (event.text && event.text.trim()) {
        const base = baseTextRef.current.trim();
        const recognized = event.text.trim();
        const combined = base ? `${base} ${recognized}` : recognized;
        onTextReceived(combined);
      }

      if (event.final || event.error) {
        isListeningRef.current = false;
        setIsListening(false);
      }
    });

    return () => {
      sub.remove();
      if (isListeningRef.current) {
        speechRecognition.stop();
      }
    };
  }, [onTextReceived]);

  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      speechRecognition.stop();
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    baseTextRef.current = getCurrentText();
    const started = await speechRecognition.start(locale);
    if (started) {
      isListeningRef.current = true;
      setIsListening(true);
    }
  }, [getCurrentText, locale]);

  const stopListening = useCallback(() => {
    if (isListeningRef.current) {
      speechRecognition.stop();
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    toggleListening,
    stopListening,
  };
}

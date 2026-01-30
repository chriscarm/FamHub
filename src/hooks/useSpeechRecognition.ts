import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@jamsch/expo-speech-recognition';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onPartialResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  timeout?: number; // Auto-stop after X ms of silence
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string | null;
  isAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    onResult,
    onPartialResult,
    onError,
    timeout = 5000,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResultRef = useRef(onResult);
  const onPartialResultRef = useRef(onPartialResult);
  const onErrorRef = useRef(onError);

  // Keep callback refs updated
  useEffect(() => {
    onResultRef.current = onResult;
    onPartialResultRef.current = onPartialResult;
    onErrorRef.current = onError;
  }, [onResult, onPartialResult, onError]);

  // Check availability
  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsAvailable(false);
      return;
    }

    const checkAvailability = async () => {
      try {
        const status = await ExpoSpeechRecognitionModule.getStateAsync();
        setIsAvailable(status !== 'inactive');
      } catch {
        setIsAvailable(true); // Assume available if check fails
      }
    };

    checkAvailability();
  }, []);

  // Handle speech recognition events
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';

    if (event.isFinal) {
      setTranscript(text);
      setPartialTranscript('');
      onResultRef.current?.(text);
      stopListeningInternal();
    } else {
      setPartialTranscript(text);
      onPartialResultRef.current?.(text);
      resetTimeout();
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    const errorMessage = event.error || 'Speech recognition error';
    setError(errorMessage);
    onErrorRef.current?.(errorMessage);
    setIsListening(false);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      stopListeningInternal();
    }, timeout);
  }, [timeout]);

  const stopListeningInternal = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } catch (err) {
      console.error('Stop listening error:', err);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isAvailable && Platform.OS !== 'web') {
      setError('Speech recognition not available');
      return;
    }

    setError(null);
    setTranscript('');
    setPartialTranscript('');

    try {
      // Request permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setError('Microphone permission denied');
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });

      setIsListening(true);
      resetTimeout();
    } catch (err: any) {
      setError(err.message || 'Failed to start speech recognition');
      onErrorRef.current?.(err.message);
    }
  }, [isAvailable, language, resetTimeout]);

  const stopListening = useCallback(async () => {
    await stopListeningInternal();
  }, [stopListeningInternal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    partialTranscript,
    error,
    isAvailable,
    startListening,
    stopListening,
  };
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Note: This hook interfaces with @picovoice/porcupine-react-native
// The actual wake word model (.ppn file) needs to be trained on Picovoice Console
// For initial testing without Picovoice, we simulate wake word detection

interface UseWakeWordOptions {
  accessKey?: string; // Picovoice access key
  keywordPath?: string; // Path to .ppn file
  sensitivity?: number; // 0.0 to 1.0
  onWakeWordDetected?: () => void;
}

interface UseWakeWordReturn {
  isListening: boolean;
  isInitialized: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}

export function useWakeWord(options: UseWakeWordOptions = {}): UseWakeWordReturn {
  const {
    accessKey = '',
    sensitivity = 0.5,
    onWakeWordDetected,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const porcupineManagerRef = useRef<any>(null);
  const onWakeWordDetectedRef = useRef(onWakeWordDetected);

  // Keep callback ref updated
  useEffect(() => {
    onWakeWordDetectedRef.current = onWakeWordDetected;
  }, [onWakeWordDetected]);

  // Initialize Porcupine
  useEffect(() => {
    if (Platform.OS === 'web') {
      setError('Wake word detection not supported on web');
      // Still mark as initialized for simulation mode
      setIsInitialized(true);
      return;
    }

    const initPorcupine = async () => {
      if (!accessKey) {
        // No access key - run in simulation mode for development
        console.log('Wake word: Running in simulation mode (no access key)');
        setIsInitialized(true);
        return;
      }

      try {
        const { PorcupineManager, BuiltInKeywords } = await import(
          '@picovoice/porcupine-react-native'
        );

        const detectionCallback = (keywordIndex: number) => {
          console.log('Wake word detected! Index:', keywordIndex);
          onWakeWordDetectedRef.current?.();
        };

        const errorCallback = (err: Error) => {
          console.error('Porcupine error:', err);
          setError(err.message);
        };

        // For development, use a built-in keyword
        // In production, replace with custom "Hey Droid" .ppn file
        porcupineManagerRef.current = await PorcupineManager.fromBuiltInKeywords(
          accessKey,
          [BuiltInKeywords.COMPUTER], // Using "Computer" as placeholder
          detectionCallback,
          errorCallback,
          undefined, // model path
          [sensitivity]
        );

        setIsInitialized(true);
        setError(null);
        console.log('Porcupine initialized successfully');
      } catch (err: any) {
        setError(err.message || 'Failed to initialize wake word detection');
        console.error('Porcupine init error:', err);
        // Still mark as initialized to allow simulation mode
        setIsInitialized(true);
      }
    };

    initPorcupine();

    return () => {
      if (porcupineManagerRef.current) {
        porcupineManagerRef.current.delete?.();
        porcupineManagerRef.current = null;
      }
    };
  }, [accessKey, sensitivity]);

  const startListening = useCallback(async () => {
    if (!isInitialized) {
      console.log('Wake word not initialized');
      return;
    }

    try {
      if (porcupineManagerRef.current) {
        await porcupineManagerRef.current.start();
        console.log('Porcupine listening started');
      } else {
        console.log('Simulation mode: Wake word listening started');
      }
      setIsListening(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start listening');
    }
  }, [isInitialized]);

  const stopListening = useCallback(async () => {
    try {
      if (porcupineManagerRef.current) {
        await porcupineManagerRef.current.stop();
        console.log('Porcupine listening stopped');
      }
      setIsListening(false);
    } catch (err: any) {
      setError(err.message || 'Failed to stop listening');
    }
  }, []);

  return {
    isListening,
    isInitialized,
    error,
    startListening,
    stopListening,
  };
}

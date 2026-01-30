import React, { useEffect, useCallback, useRef } from 'react';
import { useWakeWord } from '../../hooks/useWakeWord';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAppStore } from '../../stores/appStore';
import { parseVoiceCommand, extractCommandAfterWakeWord } from '../../services/commandParser';
import { VoiceIndicator } from './VoiceIndicator';
import { ConfirmationToast } from './ConfirmationToast';

interface VoiceListenerProps {
  // Optional Picovoice access key (get from console.picovoice.ai)
  picovoiceAccessKey?: string;
  // Enable/disable voice listening
  enabled?: boolean;
}

export function VoiceListener({
  picovoiceAccessKey,
  enabled = true,
}: VoiceListenerProps) {
  const { setVoiceState, executeCommand, voiceState } = useAppStore();
  const isProcessingRef = useRef(false);

  // Handle completed speech recognition
  const handleSpeechResult = useCallback(
    (transcript: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      setVoiceState('processing');

      // Extract command portion after wake word (if present in transcript)
      const commandText = extractCommandAfterWakeWord(transcript);

      // Parse and execute the command
      const command = parseVoiceCommand(commandText);
      executeCommand(command);

      // Reset processing flag after a delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    },
    [setVoiceState, executeCommand]
  );

  // Handle partial results (show what user is saying)
  const handlePartialResult = useCallback(
    (text: string) => {
      // Could display partial text in UI if desired
      console.log('Hearing:', text);
    },
    []
  );

  // Speech recognition hook
  const {
    startListening: startSpeech,
    stopListening: stopSpeech,
    isListening: isSpeechListening,
    isAvailable: isSpeechAvailable,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onPartialResult: handlePartialResult,
    timeout: 5000, // Stop after 5s of silence
  });

  // Handle wake word detection
  const handleWakeWordDetected = useCallback(() => {
    if (voiceState !== 'idle') return;

    console.log('Wake word detected - starting speech recognition');
    setVoiceState('listening');
    startSpeech();
  }, [voiceState, setVoiceState, startSpeech]);

  // Wake word detection hook
  const {
    startListening: startWakeWord,
    stopListening: stopWakeWord,
    isInitialized: isWakeWordReady,
  } = useWakeWord({
    accessKey: picovoiceAccessKey,
    onWakeWordDetected: handleWakeWordDetected,
  });

  // Start wake word detection when ready
  useEffect(() => {
    if (enabled && isWakeWordReady) {
      startWakeWord();
    }

    return () => {
      stopWakeWord();
      stopSpeech();
    };
  }, [enabled, isWakeWordReady]);

  // Resume wake word listening after command is processed
  useEffect(() => {
    if (voiceState === 'idle' && enabled && isWakeWordReady) {
      startWakeWord();
    }
  }, [voiceState, enabled, isWakeWordReady]);

  // For development/testing: Allow tapping to simulate wake word
  // This can be triggered from the main app
  const simulateWakeWord = useCallback(() => {
    handleWakeWordDetected();
  }, [handleWakeWordDetected]);

  // Expose simulation function globally for development
  useEffect(() => {
    if (__DEV__) {
      (global as any).simulateWakeWord = simulateWakeWord;
    }
    return () => {
      if (__DEV__) {
        delete (global as any).simulateWakeWord;
      }
    };
  }, [simulateWakeWord]);

  return (
    <>
      <VoiceIndicator />
      <ConfirmationToast />
    </>
  );
}

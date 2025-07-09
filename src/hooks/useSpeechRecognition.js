import { useCallback, useEffect, useRef, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useSpeechRecognitionCustom = (isListening, setIsListening, handleError) => {
  const [microphoneStatus, setMicrophoneStatus] = useState('idle'); // 'idle', 'requesting', 'granted', 'denied'
  
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    commands: [
      {
        command: 'stop listening',
        callback: () => {
          SpeechRecognition.stopListening();
          setIsListening(false);
          setMicrophoneStatus('idle');
        },
        matchInterim: true
      }
    ]
  });

  const timeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  // Auto-stop after 30 seconds of continuous listening
  useEffect(() => {
    if (isListening) {
      timeoutRef.current = setTimeout(() => {
        console.log('Auto-stopping speech recognition after 30 seconds');
        SpeechRecognition.stopListening();
        setIsListening(false);
        setMicrophoneStatus('idle');
      }, 30000); // 30 seconds max
    } else {
      cleanup();
    }

    return cleanup;
  }, [isListening, setIsListening, cleanup]);

  // Auto-stop after 3 seconds of silence
  useEffect(() => {
    if (isListening && transcript) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      silenceTimeoutRef.current = setTimeout(() => {
        if (isListening) {
          console.log('Auto-stopping speech recognition after 3 seconds of silence');
          SpeechRecognition.stopListening();
          setIsListening(false);
          setMicrophoneStatus('idle');
        }
      }, 3000); // 3 seconds of silence
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [transcript, isListening, setIsListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (isListening) {
        SpeechRecognition.stopListening();
      }
    };
  }, [cleanup, isListening]);

  const handleSpeechToggle = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      handleError(new Error('Speech recognition not supported'), 'Speech recognition');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition...');
      SpeechRecognition.stopListening();
      setIsListening(false);
      setMicrophoneStatus('idle');
      cleanup();
    } else {
      try {
        console.log('Starting speech recognition...');
        setMicrophoneStatus('requesting');
      resetTranscript();
        
        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        
        setMicrophoneStatus('granted');
        
        // Better configuration for voice input
        SpeechRecognition.startListening({ 
          continuous: false, // Don't listen continuously
          language: 'en-US',
          interimResults: true, // Show interim results
          maxAlternatives: 1
        });
      setIsListening(true);
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Speech recognition error:', error);
        setMicrophoneStatus('denied');
        handleError(new Error('Microphone access denied. Please allow microphone access in your browser settings.'), 'Speech recognition');
      }
    }
  }, [isListening, browserSupportsSpeechRecognition, resetTranscript, setIsListening, handleError, cleanup]);

  return {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    handleSpeechToggle,
    listening,
    isMicrophoneAvailable,
    microphoneStatus
  };
}; 
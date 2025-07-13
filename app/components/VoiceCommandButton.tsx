import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import type { VoiceCommandButtonProps } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Type definitions for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ 
  isListening, 
  onToggle, 
  disabled = false 
}) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { announceToScreenReader, triggerHapticFeedback } = useAccessibility();
  const isListeningRef = useRef(isListening);

  // Update ref when prop changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        announceToScreenReader('Voice recognition started. Say "check balance" to get your wallet balance.');
        triggerHapticFeedback('tap');
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        announceToScreenReader(`Heard: ${transcript}`);
        
        if (transcript.includes('check balance')) {
          triggerHapticFeedback('success');
          announceToScreenReader('Checking balance...');
          // Stop listening after successful command
          recognitionInstance.stop();
          onToggle(); // Notify parent to stop listening state
        } else {
          triggerHapticFeedback('warning');
          announceToScreenReader('Command not recognized. Please say "check balance".');
          // Continue listening for correct command
          if (isListeningRef.current) {
            recognitionInstance.start();
          }
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        triggerHapticFeedback('error');
        announceToScreenReader('Voice recognition error. Please try again.');
        onToggle(); // Stop listening on error
      };
      
      recognitionInstance.onend = () => {
        // Only restart if still supposed to be listening and no error occurred
        if (isListeningRef.current) {
          // Small delay before restarting to prevent rapid restarts
          setTimeout(() => {
            if (isListeningRef.current) {
              recognitionInstance.start();
            }
          }, 100);
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [onToggle, announceToScreenReader, triggerHapticFeedback]);

  // Handle listening state changes
  useEffect(() => {
    if (recognition && isSupported) {
      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
  }, [isListening, recognition, isSupported]);

  const handleToggle = () => {
    if (!isSupported) {
      announceToScreenReader('Voice recognition is not supported in this browser.');
      return;
    }
    
    onToggle();
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-100 rounded-xl cursor-not-allowed"
        aria-label="Voice commands not supported"
      >
        <MicOff className="w-4 h-4" />
        <span>Voice Commands Not Supported</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 ${
        isListening
          ? 'text-white bg-error-DEFAULT hover:bg-error-dark animate-pulse'
          : 'text-primary bg-primary bg-opacity-10 hover:bg-opacity-20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
      aria-live="polite"
    >
      {isListening ? (
        <>
          <Mic className="w-4 h-4" />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <span>Voice Commands</span>
        </>
      )}
    </button>
  );
};

export default VoiceCommandButton; 
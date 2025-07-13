import React, { useState, useEffect } from 'react';
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
  const { announceToScreenReader, triggerHapticFeedback } = useAccessibility();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
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
          // This will be handled by the parent component
          onToggle(); // Stop listening
        } else {
          triggerHapticFeedback('warning');
          announceToScreenReader('Command not recognized. Please say "check balance".');
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        triggerHapticFeedback('error');
        announceToScreenReader('Voice recognition error. Please try again.');
        onToggle(); // Stop listening
      };
      
      recognitionInstance.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, [isListening, onToggle, announceToScreenReader, triggerHapticFeedback]);

  const handleToggle = () => {
    if (!recognition) {
      announceToScreenReader('Voice recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    
    onToggle();
  };

  if (!recognition) {
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
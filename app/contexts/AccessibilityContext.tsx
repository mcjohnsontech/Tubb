import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AccessibilityContextType, AccessibilitySettings } from '../types';
import { TEXT_SCALE_FACTORS, HAPTIC_PATTERNS } from '../types';

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  textSize: 'medium',
  voiceCommandsEnabled: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          // Validate and merge with defaults
          const validSettings = {
            highContrast: typeof parsedSettings.highContrast === 'boolean' ? parsedSettings.highContrast : defaultSettings.highContrast,
            textSize: ['small', 'medium', 'large', 'extraLarge'].includes(parsedSettings.textSize) ? parsedSettings.textSize : defaultSettings.textSize,
            voiceCommandsEnabled: typeof parsedSettings.voiceCommandsEnabled === 'boolean' ? parsedSettings.voiceCommandsEnabled : defaultSettings.voiceCommandsEnabled
          };
          setSettings(validSettings);
        }
      } catch (error) {
        console.error("Failed to load accessibility settings from localStorage:", error);
        // Keep default settings on error
      } finally {
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save accessibility settings to localStorage:", error);
      }
    }
  }, [settings, isInitialized]);

  // Apply high contrast mode to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      if (settings.highContrast) {
        html.classList.add('high-contrast-mode');
      } else {
        html.classList.remove('high-contrast-mode');
      }
    }
  }, [settings.highContrast]);

  // Apply text scaling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const scaleFactor = TEXT_SCALE_FACTORS[settings.textSize];
      html.style.setProperty('--text-scale-factor', scaleFactor.toString());
    }
  }, [settings.textSize]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string) => {
    if (typeof document !== 'undefined') {
      const announcer = document.getElementById('aria-live-announcer');
      if (announcer) {
        announcer.textContent = message;
        // Clear the message after a short delay to allow for multiple announcements
        setTimeout(() => {
          announcer.textContent = '';
        }, 1000);
      }
    }
  };

  const triggerHapticFeedback = (type: 'success' | 'error' | 'warning' | 'tap') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const pattern = HAPTIC_PATTERNS[type];
      navigator.vibrate(pattern);
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    announceToScreenReader,
    triggerHapticFeedback
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}; 
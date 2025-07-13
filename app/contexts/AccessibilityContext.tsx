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
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)
    // // Load settings from localStorage if available
    // const saved = localStorage.getItem('accessibility-settings');
    // return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  // });

  // Effect to load settings from localStorage only on the client-side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') { // Check if window (and thus localStorage) is available
      try {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
          // Merge saved settings with defaults to ensure all properties exist
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        }
      } catch (error) {
        console.error("Failed to load accessibility settings from localStorage:", error);
        // Optionally, you might want to reset to defaultSettings or handle the error
      }
    }
  }, []); // Empty dependency array: runs only once after initial mount

  // // Save settings to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  // }, [settings]);

  // Effect to save settings to localStorage whenever they change (also client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') { // Always check for window before accessing localStorage
      try {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save accessibility settings to localStorage:", error);
      }
    }
  }, [settings]); // Re-run whenever settings change

  // Apply high contrast mode to document
  useEffect(() => {
    const html = document.documentElement;
    if (settings.highContrast) {
      html.classList.add('high-contrast-mode');
    } else {
      html.classList.remove('high-contrast-mode');
    }
  }, [settings.highContrast]);

  // Apply text scaling
  useEffect(() => {
    const html = document.documentElement;
    const scaleFactor = TEXT_SCALE_FACTORS[settings.textSize];
    html.style.setProperty('--text-scale-factor', scaleFactor.toString());
  }, [settings.textSize]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const announceToScreenReader = (message: string) => {
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.textContent = message;
      // Clear the message after a short delay to allow for multiple announcements
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  const triggerHapticFeedback = (type: 'success' | 'error' | 'warning' | 'tap') => {
    if (navigator.vibrate) {
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
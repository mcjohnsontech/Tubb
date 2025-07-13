import type { Route } from "./+types/settings";
import React, { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ToggleLeft, ToggleRight, Type, Mic, MicOff } from 'lucide-react';
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';
import { useAccessibilityAnnouncer } from '../hooks/useAccessibilityAnnouncer';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { TEXT_SCALE_FACTORS } from '../types';


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings page" },
    { name: "description", content: "you can set here" },
  ];
}


const Settings: React.FC = () => {
  const mainContentRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const { settings, updateSettings, triggerHapticFeedback, announceToScreenReader } = useAccessibility();

  // Focus management and accessibility announcements
  useFocusOnRouteChange({ mainContentRef, pageTitle: 'Settings' });
  useAccessibilityAnnouncer({ 
    pageTitle: 'Settings', 
    pageDescription: 'Configure accessibility settings for the digital wallet' 
  });

  const handleHighContrastToggle = () => {
    const newValue = !settings.highContrast;
    updateSettings({ highContrast: newValue });
    triggerHapticFeedback('tap');
    announceToScreenReader(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleTextSizeChange = (size: 'small' | 'medium' | 'large' | 'extraLarge') => {
    updateSettings({ textSize: size });
    triggerHapticFeedback('tap');
    announceToScreenReader(`Text size changed to ${size}`);
  };

  const handleVoiceCommandsToggle = () => {
    const newValue = !settings.voiceCommandsEnabled;
    updateSettings({ voiceCommandsEnabled: newValue });
    triggerHapticFeedback('tap');
    announceToScreenReader(`Voice commands ${newValue ? 'enabled' : 'disabled'}`);
  };

  const textSizeOptions = [
    { value: 'small', label: 'Small', description: '90% of normal size' },
    { value: 'medium', label: 'Medium', description: 'Normal size' },
    { value: 'large', label: 'Large', description: '120% of normal size' },
    { value: 'extraLarge', label: 'Extra Large', description: '140% of normal size' }
  ] as const;

  return (
    <div className="min-h-screen bg-background-DEFAULT">
      <header className="bg-background-card shadow-sm border-b border-border-DEFAULT">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary bg-opacity-10 rounded-xl hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-text-DEFAULT">Accessibility Settings</h1>
          </div>
        </div>
      </header>

      <main ref={mainContentRef} className="max-w-4xl mx-auto px-4 py-8" tabIndex={-1}>
        <div className="space-y-8">
          {/* High Contrast Mode */}
          <section className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-text-DEFAULT mb-2">High Contrast Mode</h2>
                <p className="text-sm text-text-light">
                  Increases contrast between text and background for better visibility
                </p>
              </div>
              <button
                onClick={handleHighContrastToggle}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200"
                aria-label={`${settings.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
              >
                {settings.highContrast ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-primary" />
                    <span className="text-primary">Enabled</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-text-light" />
                    <span className="text-text-light">Disabled</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Text Size */}
          <section className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <h2 className="text-xl font-semibold text-text-DEFAULT mb-4">Text Size</h2>
            <p className="text-sm text-text-light mb-4">
              Adjust the size of text throughout the application
            </p>
            
            <div className="space-y-3">
              {textSizeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border-DEFAULT hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="textSize"
                    value={option.value}
                    checked={settings.textSize === option.value}
                    onChange={() => handleTextSizeChange(option.value)}
                    className="w-4 h-4 text-primary border-border-DEFAULT focus:ring-border-focus"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-text-light" />
                      <span className="font-medium text-text-DEFAULT">{option.label}</span>
                    </div>
                    <p className="text-sm text-text-light mt-1">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Voice Commands */}
          <section className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-text-DEFAULT mb-2">Voice Commands</h2>
                <p className="text-sm text-text-light mb-2">
                  Enable voice recognition for hands-free operation
                </p>
                <p className="text-xs text-text-light">
                  Say "check balance" to get your wallet balance
                </p>
              </div>
              <button
                onClick={handleVoiceCommandsToggle}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200"
                aria-label={`${settings.voiceCommandsEnabled ? 'Disable' : 'Enable'} voice commands`}
              >
                {settings.voiceCommandsEnabled ? (
                  <>
                    <Mic className="w-6 h-6 text-primary" />
                    <span className="text-primary">Enabled</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-6 h-6 text-text-light" />
                    <span className="text-text-light">Disabled</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Accessibility Information */}
          <section className="bg-info-background rounded-2xl p-6 border border-info-DEFAULT">
            <h2 className="text-xl font-semibold text-info-text mb-4">Accessibility Features</h2>
            <div className="space-y-3 text-sm text-info-text">
              <p>
                <strong>Keyboard Navigation:</strong> Use Tab to navigate, Enter/Space to activate buttons
              </p>
              <p>
                <strong>Screen Reader Support:</strong> All elements are properly labeled and announced
              </p>
              <p>
                <strong>Focus Management:</strong> Focus automatically moves to main content on page changes
              </p>
              <p>
                <strong>Haptic Feedback:</strong> Vibration feedback on mobile devices for important actions
              </p>
              <p>
                <strong>Voice Commands:</strong> Use voice recognition to check balance (when enabled)
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings; 
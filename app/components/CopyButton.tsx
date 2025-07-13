import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { CopyButtonProps } from '../types';
import { useAccessibility } from '../contexts/AccessibilityContext';

const CopyButton: React.FC<CopyButtonProps> = ({ text, label, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const { triggerHapticFeedback, announceToScreenReader } = useAccessibility();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      triggerHapticFeedback('success');
      announceToScreenReader(`${label} copied to clipboard`);
      
      if (onCopy) {
        onCopy();
      }
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      triggerHapticFeedback('error');
      announceToScreenReader('Failed to copy to clipboard');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary bg-opacity-10 rounded-xl hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200"
      aria-label={`Copy ${label}`}
      disabled={copied}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

export default CopyButton; 
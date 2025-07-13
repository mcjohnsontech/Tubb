import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { MessageModalProps } from '../types';

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && showCloseButton) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, showCloseButton]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-success-DEFAULT" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-error-DEFAULT" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-warning-DEFAULT" />;
      case 'info':
        return <Info className="w-6 h-6 text-info-DEFAULT" />;
      case 'loading':
        return <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-background border-success-DEFAULT';
      case 'error':
        return 'bg-error-background border-error-DEFAULT';
      case 'warning':
        return 'bg-warning-background border-warning-DEFAULT';
      case 'info':
        return 'bg-info-background border-info-DEFAULT';
      case 'loading':
        return 'bg-info-background border-info-DEFAULT';
      default:
        return 'bg-background-card border-border-DEFAULT';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-success-text';
      case 'error':
        return 'text-error-text';
      case 'warning':
        return 'text-warning-text';
      case 'info':
        return 'text-info-text';
      case 'loading':
        return 'text-info-text';
      default:
        return 'text-text-DEFAULT';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md p-6 rounded-2xl border-2 shadow-xl ${getBackgroundColor()} ${getTextColor()}`}
        tabIndex={-1}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold mb-2"
            >
              {title}
            </h2>
            
            <p
              id="modal-description"
              className="text-sm leading-relaxed"
            >
              {message}
            </p>
          </div>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal; 
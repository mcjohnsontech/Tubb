import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface UseAccessibilityAnnouncerProps {
  pageTitle: string;
  pageDescription?: string;
}

export const useAccessibilityAnnouncer = ({ pageTitle, pageDescription }: UseAccessibilityAnnouncerProps) => {
  const location = useLocation();
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    const announcement = pageDescription 
      ? `Navigated to ${pageTitle} page. ${pageDescription}`
      : `Navigated to ${pageTitle} page`;
    
    announceToScreenReader(announcement);
  }, [location.pathname, pageTitle, pageDescription, announceToScreenReader]);
}; 
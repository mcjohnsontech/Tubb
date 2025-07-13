import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface UseAccessibilityAnnouncerProps {
  pageTitle: string;
  pageDescription?: string;
}

export const useAccessibilityAnnouncer = ({ pageTitle, pageDescription }: UseAccessibilityAnnouncerProps) => {
  const location = useLocation();
  const { announceToScreenReader } = useAccessibility();
  const previousPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    // Only announce if the path has actually changed
    if (previousPathRef.current !== location.pathname) {
      const announcement = pageDescription 
        ? `Navigated to ${pageTitle} page. ${pageDescription}`
        : `Navigated to ${pageTitle} page`;
      
      announceToScreenReader(announcement);
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, pageTitle, pageDescription, announceToScreenReader]);
}; 
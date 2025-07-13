import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useLocation } from 'react-router';

interface UseFocusOnRouteChangeProps {
  mainContentRef: RefObject<HTMLElement>;
  pageTitle: string;
}

export const useFocusOnRouteChange = ({ mainContentRef, pageTitle }: UseFocusOnRouteChangeProps) => {
  const location = useLocation();
  const previousPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    // Only run if the path has actually changed
    if (previousPathRef.current !== location.pathname) {
      // Update document title
      document.title = `Sui Digital Wallet - ${pageTitle}`;
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Focus the main content area after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (mainContentRef.current) {
          mainContentRef.current.focus();
        }
      }, 100);
      
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, mainContentRef, pageTitle]);
}; 
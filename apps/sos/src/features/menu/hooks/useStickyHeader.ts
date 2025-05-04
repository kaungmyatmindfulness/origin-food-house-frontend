// src/features/menu/hooks/useStickyHeader.ts
import { useState, useEffect, useCallback } from 'react';

export function useStickyHeader(threshold = 50): boolean {
  const [showStickyHeader, setShowStickyHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= threshold) {
      setShowStickyHeader(true);
    } else if (currentScrollY > lastScrollY) {
      setShowStickyHeader(false); // Scrolling down
    } else {
      setShowStickyHeader(true); // Scrolling up
    }
    // Use functional update to prevent stale closure issues
    setLastScrollY(currentScrollY);
  }, [lastScrollY, threshold]); // Include threshold in dependencies

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]); // Dependency is the memoized callback

  return showStickyHeader;
}

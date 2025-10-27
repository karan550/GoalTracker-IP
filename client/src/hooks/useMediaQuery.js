import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const isClient = typeof window !== 'undefined' && typeof window.matchMedia === 'function';

  const [matches, setMatches] = useState(() => {
    if (!isClient) return false;
    try {
      return window.matchMedia(query).matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (!isClient) return undefined;

    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    // Set initial value in case it changed before effect ran
    if (media.matches !== matches) setMatches(media.matches);

    // Prefer modern API but fallback for older browsers
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }

    // Fallback
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [query]);

  return matches;
};

// Common breakpoint hooks
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 * @param query The media query to check
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false on the server or during initial client-side rendering
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set the initial value
      setMatches(media.matches);

      // Define a callback function to handle changes
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add the callback as a listener for changes to the media query
      media.addEventListener('change', listener);

      // Remove the listener when the component is unmounted
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]); // Re-run effect if query changes

  return matches;
}

export default useMediaQuery;

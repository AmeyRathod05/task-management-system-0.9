import { useState, useEffect } from 'react';

// Simple way to check if we're on the server
export const isServer = typeof window === 'undefined';

// Simple hook to detect if we're on the client
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This effect only runs on the client
    console.log('Client-side rendering detected');
    setIsClient(true);
  }, []);
  
  return isClient;
}

// Log where the code is running
if (isServer) {
  console.log('SSR Check - Running on server');
} else {
  console.log('SSR Check - Running on client');
}

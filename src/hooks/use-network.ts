import { useEffect, useState } from "react";

/**
 * Mock network hook for offline resilience.
 * In a real app, this would use expo-network or @react-native-community/netinfo.
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // For demonstration, let's just stay online.
    // In a real environment, we'd listen to connectivity changes.
    setIsOnline(true);
  }, []);

  return { isOnline };
}

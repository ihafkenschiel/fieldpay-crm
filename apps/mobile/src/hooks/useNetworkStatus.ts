import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDiagnosticsStore } from '../stores/diagnostics.store';

/**
 * Hook to monitor network connectivity and update diagnostics store.
 */
export function useNetworkStatus() {
  const setNetworkState = useDiagnosticsStore((s) => s.setNetworkState);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const status = state.isConnected ? 'online' : 'offline';
      setNetworkState(status);
    });

    return () => unsubscribe();
  }, [setNetworkState]);
}

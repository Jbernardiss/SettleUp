import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isConnected,
  isAllowed,
  getAddress,
  getNetwork,
  setAllowed,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";

type FreighterState = {
  isInstalled: boolean;
  isPermitted: boolean;
  publicKey?: string;
  network?: string;
  error?: string;
};

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    isInstalled: typeof window !== "undefined" && !!(window as any).freighterApi,
    isPermitted: false,
  });

  const refresh = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        setState((s) => ({ ...s, isPermitted: false, publicKey: undefined, network: undefined, error: undefined }));
        return;
      }

      const allowed = await isAllowed();
      if (!allowed.isAllowed) {
        setState((s) => ({ ...s, isPermitted: false, publicKey: undefined, network: undefined, error: undefined }));
        return;
      }

      const addressResult = await getAddress();
      const networkResult = await getNetwork();
      
      setState((s) => ({ 
        ...s, 
        isPermitted: true, 
        publicKey: addressResult.address, 
        network: networkResult.network, 
        error: undefined 
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? "Failed to refresh Freighter state" }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    try {
      const accessResult = await requestAccess();
      if (accessResult.error) {
        setState((s) => ({ ...s, error: accessResult.error }));
        return false;
      }

      const allowedResult = await setAllowed();
      if (allowedResult.error) {
        setState((s) => ({ ...s, error: allowedResult.error }));
        return false;
      }

      await refresh();
      return true;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? "Failed to connect Freighter" }));
      return false;
    }
  }, [refresh]);

  const disconnect = useCallback(async () => {
    // Freighter does not expose a disconnect; we can only clear local state
    setState((s) => ({ ...s, isPermitted: false, publicKey: undefined }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      refresh,
      signTransaction,
    }),
    [state, connect, disconnect, refresh]
  );

  return value;
}



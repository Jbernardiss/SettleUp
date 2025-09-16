import { useCallback, useEffect, useMemo, useState } from "react";
import getPublicKey, {
  isConnected,
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
    isInstalled:
      typeof window !== "undefined" && !!(window as any).freighterApi,
    isPermitted: false,
  });

  const refresh = useCallback(async () => {
    try {
      // const permitted = await isConnected();
      // const pk = permitted ? getPublicKey : undefined;
      // const net = permitted ? await getNetwork() : undefined;
      const permittedResult = await isConnected();
      const pkResult = permittedResult.isConnected ? await getPublicKey.getAddress() : undefined;
      const netResult = permittedResult.isConnected ? await getNetwork() : undefined;
      
      setState((s) => ({
        ...s,
        isPermitted: permittedResult.isConnected,
        publicKey: pkResult?.address,
        network: netResult?.network,
        error: undefined,
      }));
    } catch (e: any) {
      setState((s) => ({
        ...s,
        error: e?.message ?? "Failed to refresh Freighter state",
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    try {
      await requestAccess();
      await setAllowed();
      await refresh();
      return true;
    } catch (e: any) {
      setState((s) => ({
        ...s,
        error: e?.message ?? "Failed to connect Freighter",
      }));
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

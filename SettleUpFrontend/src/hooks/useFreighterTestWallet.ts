import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isConnected,
  isAllowed,
  getAddress,
  getNetwork,
  setAllowed,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import Server, { Asset, Transaction, TransactionBuilder, Operation, Memo, Networks } from "stellar-sdk";

// Test wallet information type
type TestWalletInfo = {
  isInstalled: boolean;
  isConnected: boolean;
  isPermitted: boolean;
  publicKey?: string;
  network?: string;
  balance?: string;
  nativeBalance?: string;
  testnetBalance?: string;
  error?: string;
  isLoading: boolean;
};

// Transaction parameters type
type TransactionParams = {
  destinationId: string;
  amount: string;
  memo?: string;
  assetCode?: string;
  assetIssuer?: string;
};

// Test wallet operations
type TestWalletOperations = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  getBalance: (
    assetCode?: string,
    assetIssuer?: string
  ) => Promise<string | null>;
  getTestnetBalance: () => Promise<string | null>;
  switchToTestnet: () => Promise<boolean>;
  isTestnet: () => boolean;
  getAccountDetails: () => Promise<any>;
  makeTransaction: (params: TransactionParams) => Promise<any>;
};

export function useFreighterTestWallet(): TestWalletInfo &
  TestWalletOperations {
  const [state, setState] = useState<TestWalletInfo>({
    isInstalled:
      typeof window !== "undefined" && !!(window as any).freighterApi,
    isConnected: false,
    isPermitted: true,
    isLoading: false,
  });

  // Check if we're on testnet
  const isTestnet = useCallback(() => {
    return state.network === "testnet" || state.network === "TESTNET";
  }, [state.network]);

  // Get the appropriate server based on network
  const getServer = useCallback(() => {
    if (isTestnet()) {
      return new Server("https://horizon-testnet.stellar.org");
    }
    return new Server("https://horizon.stellar.org");
  }, [isTestnet]);

  // Get account balance for a specific asset
  const getBalance = useCallback(
    async (
      assetCode?: string,
      assetIssuer?: string
    ): Promise<string | null> => {
      if (!state.publicKey) return null;

      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const server = getServer();
        const account = await server.loadAccount(state.publicKey);

        if (assetCode && assetIssuer) {
          // Custom asset
          const balance = account.balances.find(
            (b: any) =>
              b.asset_code === assetCode && b.asset_issuer === assetIssuer
          );
          return balance ? balance.balance : "0";
        } else {
          // Native XLM (default)
          const balance = account.balances.find(
            (b: any) => b.asset_type === "native"
          );
          return balance ? balance.balance : "0";
        }
      } catch (error: any) {
        console.error("Error fetching balance:", error);
        setState((prev) => ({ ...prev, error: error.message }));
        return null;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.publicKey, getServer]
  );

  // Get testnet balance specifically
  const getTestnetBalance = useCallback(async (): Promise<string | null> => {
    if (!isTestnet()) {
      setState((prev) => ({ ...prev, error: "Not connected to testnet" }));
      return null;
    }
    return getBalance();
  }, [isTestnet, getBalance]);

  // Get comprehensive account details
  const getAccountDetails = useCallback(async () => {
    if (!state.publicKey) return null;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const server = getServer();
      const account = await server.loadAccount(state.publicKey);

      return {
        accountId: account.accountId(),
        balances: account.balances,
        sequenceNumber: account.sequenceNumber(),
        subentryCount: account.subentryCount(),
        thresholds: account.thresholds,
        flags: account.flags,
        signers: account.signers,
        data: account.data,
      };
    } catch (error: any) {
      console.error("Error fetching account details:", error);
      setState((prev) => ({ ...prev, error: error.message }));
      return null;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.publicKey, getServer]);

  // Make transaction
  const makeTransaction = useCallback(
    async (params: TransactionParams) => {
      const { destinationId, amount, memo, assetCode, assetIssuer } = params;

      if (!state.publicKey) {
        setState((prev) => ({ ...prev, error: "No public key available" }));
        return null;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

        const server = getServer();
        
        // Check if destination account exists
        try {
          await server.loadAccount(destinationId);
        } catch (error: any) {
          if (error.name === "NotFoundError") {
            setState((prev) => ({ 
              ...prev, 
              error: "Destination account does not exist",
              isLoading: false 
            }));
            return null;
          }
          throw error;
        }

        // Load source account
        const sourceAccount = await server.loadAccount(state.publicKey);

        // Determine asset
        let asset = Asset.native(); // Default to XLM
        if (assetCode && assetIssuer) {
          asset = new Asset(assetCode, assetIssuer);
        }

        // Get network passphrase
        const networkPassphrase = isTestnet() ? Networks.TESTNET : Networks.PUBLIC;

        // Build transaction
        const transactionBuilder = new TransactionBuilder(sourceAccount, {
          fee: "100000", // 0.01 XLM
          networkPassphrase,
        });

        // Add payment operation
        transactionBuilder.addOperation(
          Operation.payment({
            destination: destinationId,
            asset: asset,
            amount: amount,
          })
        );

        // Add memo if provided
        if (memo) {
          transactionBuilder.addMemo(Memo.text(memo));
        }

        // Set timeout and build
        const transaction = transactionBuilder.setTimeout(180).build();

        // Convert to XDR for signing
        const transactionXDR = transaction.toXDR();

        // Sign transaction using Freighter
        const signedTransaction = await signTransaction(transactionXDR, {
          networkPassphrase,
          address: state.publicKey,
        });

        // Reconstruct transaction from signed XDR
        const signedTx = new Transaction(signedTransaction.signedTxXdr, networkPassphrase);

        // Submit transaction
        const result = await server.submitTransaction(signedTx);

        setState((prev) => ({ ...prev, isLoading: false }));

        // Refresh balance after successful transaction
        await refresh();

        return {
          success: true,
          hash: result.hash,
          result: result,
        };

      } catch (error: any) {
        console.error("Transaction error:", error);
        setState((prev) => ({
          ...prev,
          error: error?.message || "Transaction failed",
          isLoading: false,
        }));
        return {
          success: false,
          error: error?.message || "Transaction failed",
        };
      }
    },
    [state.publicKey, getServer, isTestnet]
  );

  // Refresh wallet state
  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const connected = await isConnected();
      if (!connected.isConnected) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isPermitted: false,
          publicKey: undefined,
          network: undefined,
          balance: undefined,
          nativeBalance: undefined,
          testnetBalance: undefined,
          isLoading: false,
        }));
        return;
      }

      const allowed = await isAllowed();
      if (!allowed.isAllowed) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isPermitted: false,
          publicKey: undefined,
          network: undefined,
          balance: undefined,
          nativeBalance: undefined,
          testnetBalance: undefined,
          isLoading: false,
        }));
        return;
      }

      const addressResult = await getAddress();
      const networkResult = await getNetwork();

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isPermitted: true,
        publicKey: addressResult.address,
        network: networkResult.network,
        isLoading: false,
      }));

      // Fetch balance after connection is established
      if (addressResult.address) {
        const balance = await getBalance();
        if (balance) {
          setState((prev) => ({
            ...prev,
            balance,
            nativeBalance: balance,
            testnetBalance: isTestnet() ? balance : undefined,
          }));
        }
      }
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        error: e?.message ?? "Failed to refresh Freighter state",
        isLoading: false,
      }));
    }
  }, [getBalance, isTestnet]);

  // Connect to Freighter
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const accessResult = await requestAccess();
      if (accessResult.error) {
        setState((prev) => ({
          ...prev,
          error: accessResult.error,
          isLoading: false,
        }));
        return false;
      }

      const allowedResult = await setAllowed();
      if (allowedResult.error) {
        setState((prev) => ({
          ...prev,
          error: allowedResult.error,
          isLoading: false,
        }));
        return false;
      }

      await refresh();
      return true;
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        error: e?.message ?? "Failed to connect Freighter",
        isLoading: false,
      }));
      return false;
    }
  }, [refresh]);

  // Disconnect (clear local state)
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isPermitted: false,
      publicKey: undefined,
      network: undefined,
      balance: undefined,
      nativeBalance: undefined,
      testnetBalance: undefined,
      error: undefined,
    }));
  }, []);

  // Switch to testnet (this would require user to manually switch in Freighter)
  const switchToTestnet = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

      // Refresh to get updated network
      await refresh();

      if (isTestnet()) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: "Please switch to testnet in Freighter extension",
          isLoading: false,
        }));
        return false;
      }
    } catch (e: any) {
      setState((prev) => ({
        ...prev,
        error: e?.message ?? "Failed to switch to testnet",
        isLoading: false,
      }));
      return false;
    }
  }, [refresh, isTestnet]);

  // Auto-refresh on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Return combined state and operations
  const value = useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      refresh,
      getBalance,
      getTestnetBalance,
      switchToTestnet,
      isTestnet,
      getAccountDetails,
      makeTransaction,
    }),
    [
      state,
      connect,
      disconnect,
      refresh,
      getBalance,
      getTestnetBalance,
      switchToTestnet,
      isTestnet,
      getAccountDetails,
      makeTransaction,
    ]
  );

  return value;
}

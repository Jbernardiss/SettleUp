import React, { useState } from "react";
import { Button } from "../components";
import { useFreighterTestWallet } from "../hooks/useFreighterTestWallet";

export const Home: React.FC = () => {
  const {
    isInstalled,
    isConnected,
    isPermitted,
    publicKey,
    network,
    balance,
    nativeBalance,
    error,
    isLoading,
    connect,
    disconnect,
    refresh,
    getAccountDetails,
    makeTransaction,
  } = useFreighterTestWallet();

  // transaction form state
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const handleTransaction = async () => {
    if (!destination || !amount) {
      alert("Destination and amount are required.");
      return;
    }

    const result = await makeTransaction({
      destinationId: destination,
      amount,
      memo,
    });

    if (result?.success) {
      alert(`✅ Transaction submitted! Hash: ${result.hash}`);
      setDestination("");
      setAmount("");
      setMemo("");
    } else {
      alert(`❌ Transaction failed: ${result?.error}`);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center py-12">
      <h1 className="text-center text-5xl mb-6">Stellar Walletttttt</h1>

      {!isInstalled && (
        <div className="text-red-600">
          Freighter extension not installed. Please install it to continue.
        </div>
      )}

      {isInstalled && !isPermitted && (
        <Button onClick={connect} text="Connect Freighter" variant="primary" />
      )}

      {isPermitted && (
        <div className="w-full max-w-2xl rounded border p-6 space-y-4">
          <div className="text-sm text-gray-700">Network: {network}</div>
          <div className="text-sm text-gray-700 break-all">
            Public Key: {publicKey}
          </div>

          {isLoading && <div className="text-sm">Loading account info…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}

          {nativeBalance && (
            <div className="text-sm">
              <strong>Balance (XLM):</strong> {nativeBalance}
            </div>
          )}

          {/* Transaction form */}
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Make a Transaction</h2>
            <div className="space-y-2">
              <input
                className="w-full rounded border p-2 text-sm"
                placeholder="Destination account ID"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
              <input
                className="w-full rounded border p-2 text-sm"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                className="w-full rounded border p-2 text-sm"
                placeholder="Memo (optional)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              <Button
                onClick={handleTransaction}
                text="Send Payment"
                variant="primary"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button onClick={refresh} text="Refresh" variant="secondary" />
            <Button onClick={disconnect} text="Disconnect" variant="tertiary" />
          </div>
        </div>
      )}
    </div>
  );
};

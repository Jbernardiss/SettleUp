import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EventsCARD } from "../components/index";
import type { EventData } from "../hooks/useEvents";
import { useFreighterWallet } from "../contexts/FreighterWalletContext";

// Dados mocados para os eventos (do primeiro código)
const mockEvents: EventData[] = [
    {
      id: '1',
      name: 'Churrasco de Fim de Ano',
      members: ['Alice', 'Beto', 'Carla'],
      expenses: [],
      totalAmount: 350.00,
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Viagem para a Praia',
      members: ['Daniel', 'Eduarda', 'Fernanda', 'Gabriel'],
      expenses: [],
      totalAmount: 1250.50,
      status: 'ACTIVE',
    },
    {
      id: '3',
      name: 'Festa de Aniversário',
      members: ['Heitor', 'Julia'],
      expenses: [],
      totalAmount: 500.00,
      status: 'PENDING'
    },
];


export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Hooks da carteira (do segundo código)
  const {
    isInstalled,
    isPermitted,
    publicKey,
    network,
    nativeBalance,
    error,
    isLoading,
    connect,
    disconnect,
    refresh,
    makeTransaction,
  } = useFreighterWallet();

  // State do formulário de transação
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  // Handler para a transação
  const handleTransaction = async () => {
    if (!destination || !amount) {
      alert("Destination and amount are required.");
      return;
    }
    const result = await makeTransaction({ destinationId: destination, amount, memo });
    if (result?.success) {
      alert(`✅ Transaction submitted! Hash: ${result.hash}`);
      setDestination("");
      setAmount("");
      setMemo("");
    } else {
      alert(`❌ Transaction failed: ${result?.error}`);
    }
  };

  // Handler para o botão de notificações
  const handleNotificacoesClick = useCallback(() => {
    navigate("/notificacoes");
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center py-12 px-4">
      <h1 className="text-center text-5xl mb-6">Stellar Wallet</h1>

      {!isInstalled && (
        <div className="text-red-600">
          Freighter extension not installed. Please install it to continue.
        </div>
      )}

      {isInstalled && !isPermitted && (
        <Button onClick={connect} text="Connect Freighter" variant="primary" disabled={false} />
      )}

      {/* Caixa principal da carteira */}
      {isPermitted && (
        <div className="w-full max-w-2xl rounded border bg-white p-6 space-y-4 shadow-md">
          <div className="text-sm text-gray-700">Network: <span className="font-bold text-green-600">{network}</span></div>
          <div className="text-sm text-gray-700 break-all">
            Public Key: <span className="font-mono">{publicKey}</span>
          </div>

          {isLoading && <div className="text-sm">Loading account info…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}

          {nativeBalance && (
            <div className="text-lg">
              <strong>Balance (XLM):</strong> {nativeBalance}
            </div>
          )}

          {/* Formulário de transação */}
          <div className="pt-4 border-t">
            <h2 className="font-semibold mb-2 text-lg">Make a Transaction</h2>
            <div className="space-y-3">
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
            </div>
          </div>
          
          {/* Botões de ação em uma única linha */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            <Button
              onClick={handleTransaction}
              text="Send Payment"
              variant="primary"
              disabled={false}
            />
             <Button
              onClick={handleNotificacoesClick}
              text="Notificações"
              variant="secondary"
              disabled={false}
            />
            <Button onClick={refresh} text="Refresh" variant="secondary" disabled={false} />
            
            <Button onClick={disconnect} text="Disconnect" variant="tertiary" disabled={false} />
          </div>
        </div>
      )}

      {/* Lista de eventos (exibida abaixo da caixa da carteira) */}
      {isPermitted && (
         <div className="mt-12 w-full max-w-2xl rounded-lg border border-gray-600 bg-gray-700 p-6 shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-white">Meus Eventos</h2>
            <div className="flex flex-col gap-6">
              {mockEvents.map(event => (
                <EventsCARD key={event.id} event={event} />
              ))}
            </div>
          </div>
      )}
    </div>
  );
};
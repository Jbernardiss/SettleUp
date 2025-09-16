import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EventsCARD } from "../components/index";
import { useUserEvents } from "../hooks/useEvents"; // Importando o hook de eventos
import { useFreighterWallet } from "../contexts/FreighterWalletContext";
import { Plus } from "lucide-react";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const {
    isInstalled,
    isPermitted,
    publicKey,
    network,
    nativeBalance,
    error: walletError, // Renomeando para evitar conflito
    isLoading: walletIsLoading, // Renomeando para evitar conflito
    connect,
    disconnect,
    makeTransaction,
  } = useFreighterWallet();

  // Usando o hook useEvents com a chave pública do usuário
  const { data: events, isLoading: eventsIsLoading, error: eventsError } = useUserEvents(publicKey);

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

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

  const handleNotificacoesClick = useCallback(() => {
    navigate("/notificacoes");
  }, [navigate]);

  const handleCreateEventClick = useCallback(() => {
    navigate("/qrcode");
  }, [navigate]);

  const showEvents = (events && events.length > 0);
  console.log(showEvents, events, eventsError);

  return (
    <div className="relative flex min-h-screen flex-col items-center py-12 px-4">
      {/* Notification bell icon */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleNotificacoesClick}
          className="relative p-2 text-gray-100 hover:text-gray-200 transition-colors"
          aria-label="Notifications"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </div>

      <h1 className="text-center text-5xl mb-6">Stellar Wallet</h1>

      {!isInstalled && (
        <div className="text-red-600">
          Freighter extension not installed. Please install it to continue.
        </div>
      )}

      {isInstalled && !isPermitted && (
        <Button onClick={connect} text="Connect Freighter" variant="primary" disabled={false} />
      )}

      {isPermitted && (
        <div className="w-full max-w-2xl rounded border bg-white p-6 space-y-4 shadow-md">
          <div className="text-sm text-gray-700">Network: <span className="font-bold text-green-600">{network}</span></div>
          <div className="text-sm text-gray-700 break-all">
            Public Key: <span className="font-mono">{publicKey}</span>
          </div>

          {walletIsLoading && <div className="text-sm">Loading account info…</div>}
          {walletError && <div className="text-sm text-red-500">{walletError}</div>}

          {nativeBalance && (
            <div className="text-lg">
              <strong>Balance (XLM):</strong> {nativeBalance}
            </div>
          )}

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
            <Button onClick={disconnect} text="Disconnect" variant="tertiary" disabled={false} />
          </div>
        </div>
      )}

      {isPermitted && (
         <div className="mt-12 w-full max-w-2xl rounded-lg border border-gray-600 bg-gray-700 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Meus Eventos</h2>
              <button
                onClick={handleCreateEventClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                title="Criar novo evento"
              >
                <Plus size={20} />
                Criar Evento
              </button>
            </div>
            {eventsIsLoading && <p className="text-white">Carregando eventos...</p>}
            {eventsError && <p className="text-red-400">Erro ao carregar eventos.</p>}
            <div className="flex flex-col gap-6">
              {Array.isArray(events) && events.length > 0 ? (
                events.map(event => (
                  // @ts-ignore
                  <EventsCARD key={event.id} event={event} />
                ))
              ) : (
                !eventsIsLoading && <p className="text-gray-400">Nenhum evento encontrado.</p>
              )}
            </div>
          </div>
      )}
    </div>
  );
};
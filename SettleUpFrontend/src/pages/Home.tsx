// src/pages/Home.tsx

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EventsCARD } from "../components/index"; // O componente Button foi removido pois não é mais usado aqui
import { useUserEvents } from "../hooks/useEvents";
import { useFreighterWallet } from "../contexts/FreighterWalletContext";
import { Plus, Bell } from "lucide-react";
import styles from "../styles/Home.module.css";
import { type Event } from "../../../src/models/model.event";

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

  const {
    data: events,
    isLoading: eventsIsLoading,
    error: eventsError,
  } = useUserEvents(publicKey);

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
    <div className={styles.container}>
      {isPermitted && (
        <header className={styles.header}>
          {/* Botão Disconnect atualizado */}
          <button
            onClick={disconnect}
            className={styles.createEventButton}
          >
            Disconnect
          </button>
          <button
            onClick={handleNotificationClick}
            className={styles.bellButton}
            title="Notificações"
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

      {/* Título com novo estilo será aplicado automaticamente pela alteração no CSS */}
      <h1 className={styles.title}>SettleUp</h1>

      {!isInstalled && (
        <div className="text-red-600">
          Freighter extension not installed. Please install it to continue.
        </div>
      )}

      {isInstalled && !isPermitted && (
         <button onClick={connect} className={styles.createEventButton}>
           Connect Freighter
         </button>
      )}

      <div className={styles.mainContent}>
        {isPermitted && (
          <>
            <div className={styles.walletInfo}>
              <div className={styles.infoRow}>
                <span>Network:</span>
                <span className="font-bold text-green-600">{network}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Public Key:</span>
                <span className="font-mono truncate">{publicKey}</span>
              </div>

              {walletIsLoading && <div className="text-sm">Loading...</div>}
              {walletError && (
                <div className="text-sm text-red-500">{walletError}</div>
              )}

              {nativeBalance && (
                <div className={styles.balance}>
                  <strong>Balance (XLM):</strong> {nativeBalance}
                </div>
              )}

              <div className={styles.transactionSection}>
                <h2 className={styles.sectionTitle}>Make a Transaction</h2>
                <input
                  className={styles.input}
                  placeholder="Destination account ID"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Amount (XLM)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Memo (optional)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>

              <div className={styles.buttonGroup}>
                {/* Botão Send Payment atualizado */}
                <button
                  onClick={handleTransaction}
                  className={styles.createEventButton}
                >
                  Send Payment
                </button>
              </div>
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

            <div className={styles.eventsSection}>
              <div className={styles.eventsHeader}>
                <h2 className={styles.eventsTitle}>Meus Eventos</h2>
                <button
                  onClick={handleCreateEventClick}
                  className={styles.createEventButton}
                  title="Criar novo evento"
                >
                  <Plus size={20} />
                  Criar Evento
                </button>
              </div>
              {eventsIsLoading && <p>Carregando eventos...</p>}
              {eventsError && <p>Erro ao carregar eventos.</p>}
              <div className={styles.eventsGrid}>
                {Array.isArray(events) && events.length > 0 ? (
                  events.map((event: Event) => (
                    <EventsCARD key={event.id} event={event} />
                  ))
                ) : (
                  !eventsIsLoading && <p>Nenhum evento encontrado.</p>
                )}
              </div>
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
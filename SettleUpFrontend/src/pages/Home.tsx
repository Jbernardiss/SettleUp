import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EventsCARD } from "../components/index";
import { useUserEvents } from "../hooks/useEvents"; // Importando o hook de eventos
import { useFreighterWallet } from "../contexts/FreighterWalletContext";
import { Plus, Bell } from "lucide-react"; // Importando o ícone Bell
import styles from "../styles/Home.module.css";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const {
    isInstalled,
    isPermitted,
    publicKey,
    network,
    nativeBalance,
    error: walletError,
    isLoading: walletIsLoading,
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

  const handleCreateEventClick = useCallback(() => {
    navigate("/qrcode");
  }, [navigate]);

  const handleNotificationClick = useCallback(() => {
    navigate("/notificacoes");
  }, [navigate]);

  return (
    <div className={styles.container}>
      {isPermitted && (
        <header className={styles.header}>
          <Button
            onClick={disconnect}
            text="Disconnect"
            variant="tertiary"
            disabled={false}
          />
          <button
            onClick={handleNotificationClick}
            className={styles.bellButton}
            title="Notificações"
          >
            <Bell size={24} />
          </button>
        </header>
      )}

      <h1 className={styles.title}>SettleUp</h1>

      {isInstalled && !isPermitted && (
        <Button
          onClick={connect}
          text="Connect Freighter"
          variant="primary"
          disabled={false}
        />
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
                <Button
                  onClick={handleTransaction}
                  text="Send Payment"
                  variant="primary"
                  disabled={false}
                />
              </div>
            </div>

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
                  events.map((event) => (
                    // @ts-ignore
                    <EventsCARD key={event.id} event={event} />
                  ))
                ) : (
                  !eventsIsLoading && <p>Nenhum evento encontrado.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EventsCARD } from "../components/index";
import { useUserEvents } from "../hooks/useEvents";
import { useFreighterWallet } from "../contexts/FreighterWalletContext";
import { Plus, Bell } from "lucide-react";
import styles from "../styles/Home.module.css";
import settleUpLogo from "../assets/settleup-logo.png"; // Importe o logo

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
          <button
            onClick={disconnect}
            className={styles.actionButton}
            style={{ width: 'auto', backgroundColor: '#6c757d' }}
          >
            Disconnect
          </button>
          {/* MUDANÇA: Novo grupo para o sino e o logo, alinhado à direita */}
          <div className={styles.rightHeaderGroup}>
            <button
              onClick={handleNotificationClick}
              className={styles.bellButton}
              title="Notificações"
            >
              <Bell size={24} />
            </button>
            <img src={settleUpLogo} alt="SettleUp Logo" className={styles.headerLogo} />
          </div>
        </header>
      )}

      {/* MUDANÇA: O título "SettleUp" principal agora é apenas um título */}
      <h1 className={styles.title}>SettleUp</h1> 

      {isInstalled && !isPermitted && (
        <button
          onClick={connect}
          className={styles.actionButton}
        >
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
                      <strong>Balance (XLM):</strong> {parseInt(nativeBalance, 10).toLocaleString()}
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
                <button
                  onClick={handleTransaction}
                  className={styles.actionButton}
                >
                  Send Payment
                </button>
              </div>
            </div>

            <div className={styles.eventsSection}>
              <div className={styles.eventsContainer}>
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
                
                {!eventsIsLoading && !eventsError && (
                  Array.isArray(events) && events.length > 0 ? (
                    <div className={styles.eventsGrid}>
                      {events.map((event) => (
                        // @ts-ignore
                        <EventsCARD key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noEventsMessage}>
                      Nenhum evento encontrado.
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

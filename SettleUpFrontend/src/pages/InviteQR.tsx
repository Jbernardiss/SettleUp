import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Share2, Copy, Calendar, ArrowRight } from "lucide-react";
import { toCanvas } from "qrcode";
import styles from "../styles/InviteQR.module.css";

interface EventData {
  id: string;
  name: string;
}

const InviteQR: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const inviteUrl = eventData
    ? `http://https://settleup-seven.vercel.app/events/${eventData.id}?invite`
    : "";

  useEffect(() => {
    // Obter dados do evento dos parâmetros da URL ou localStorage
    const eventId = searchParams.get("eventId");
    const eventName = searchParams.get("eventName");

    if (eventId && eventName) {
      setEventData({
        id: eventId,
        name: eventName,
      });
    } else {
      // Fallback para localStorage
      const currentEvent = localStorage.getItem("settleup_current_event");
      if (currentEvent) {
        setEventData(JSON.parse(currentEvent));
      } else {
        navigate("/create-event");
      }
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (eventData && canvasRef.current) {
      generateQRCode();
    }
  }, [eventData]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !eventData) return;

    try {
      toCanvas(canvasRef.current, inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrGenerated(true);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
  };

  const handleShare = async () => {
    if (!eventData) return;

    const shareText = `Você foi convidado para o evento "${eventData.name}" no SettleUp! Entre no link: ${inviteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Convite - ${eventData.name}`,
          text: shareText,
          url: inviteUrl,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessMessage("Convite copiado para área de transferência!");
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopySuccess(true);
      showSuccessMessage("Link copiado!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const showSuccessMessage = (message: string) => {
    // Implementar toast notification aqui
    console.log(message);
  };

  const goToEvent = () => {
    if (!eventData) return;

    // Redirecionar para dashboard do evento
    navigate(`/event/${eventData.id}`);
  };

  if (!eventData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={goToEvent} type="button">
          <ArrowLeft size={24} />
        </button>
        <h1>Convidar Participantes</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.inviteContainer}>
          <div className={styles.eventInfo}>
            <div className={styles.eventHeader}>
              <div className={styles.eventIcon}>
                <Calendar size={32} />
              </div>
              <div className={styles.eventDetails}>
                <h2>{eventData.name}</h2>
                <p className={styles.eventId}>ID: {eventData.id}</p>
              </div>
            </div>
          </div>

          <div className={styles.qrSection}>
            <div className={styles.qrHeader}>
              <h3>Convite via QR Code</h3>
              <p>Escaneie o código para entrar no evento</p>
            </div>

            <div className={styles.qrContainer}>
              <canvas
                ref={canvasRef}
                className={styles.qrCode}
                style={{ display: qrGenerated ? "block" : "none" }}
              />
              {!qrGenerated && (
                <div className={styles.qrFallback}>
                  <p>Gerando QR Code...</p>
                </div>
              )}
            </div>

            <div className={styles.inviteOptions}>
              <button
                className={styles.shareBtn}
                onClick={handleShare}
                type="button"
              >
                <Share2 size={20} />
                <span>Compartilhar Convite</span>
              </button>

              <button
                className={styles.copyBtn}
                onClick={handleCopyLink}
                type="button"
              >
                <Copy size={20} />
                <span>Copiar Link</span>
              </button>
            </div>
          </div>

          <div className={styles.manualInvite}>
            <h4>Convite Manual</h4>
            <div className={styles.inviteLinkContainer}>
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className={styles.inviteLink}
              />
              <button
                className={`${styles.copyLinkBtn} ${
                  copySuccess ? styles.copied : ""
                }`}
                onClick={handleCopyLink}
                type="button"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h4>Próximos Passos</h4>
            <ol>
              <li>Compartilhe o QR Code ou link com os participantes</li>
              <li>Aguarde os participantes entrarem no evento</li>
              <li>Comece a adicionar gastos para dividir</li>
            </ol>
          </div>

          <button
            className={styles.continueBtn}
            onClick={goToEvent}
            type="button"
          >
            <span>Ir para o Evento</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default InviteQR;

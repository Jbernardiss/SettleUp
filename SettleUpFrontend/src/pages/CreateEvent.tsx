import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, ArrowRight } from "lucide-react";
import styles from "../styles/CreateEvent.module.css";

interface EventData {
  id: string;
  name: string;
  createdAt: string;
  participants: string[];
  expenses: any[];
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateEventId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const saveEventToStorage = (eventData: EventData) => {
    const events = JSON.parse(localStorage.getItem("settleup_events") || "[]");
    events.push(eventData);
    localStorage.setItem("settleup_events", JSON.stringify(events));
    localStorage.setItem("settleup_current_event", JSON.stringify(eventData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setError("Por favor, insira um nome para o evento.");
      return;
    }

    if (eventName.trim().length < 3) {
      setError("O nome do evento deve ter pelo menos 3 caracteres.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Simular criação do evento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const eventData: EventData = {
        id: generateEventId(),
        name: eventName.trim(),
        createdAt: new Date().toISOString(),
        participants: [],
        expenses: [],
      };

      saveEventToStorage(eventData);

      // Redirecionar para página de convites
      navigate(
        `/invite-qr?eventId=${eventData.id}&eventName=${encodeURIComponent(
          eventData.name
        )}`
      );
    } catch (err) {
      setError("Erro ao criar evento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEventName(value);

    if (error && value.length >= 3) {
      setError("");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          type="button"
        >
          <ArrowLeft size={24} />
        </button>
        <h1>Criar Evento</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.eventFormContainer}>
          <div className={styles.formHeader}>
            <div className={styles.iconContainer}>
              <Calendar size={48} />
            </div>
            <h2>Novo Evento</h2>
            <p>Crie um evento para dividir gastos com seus amigos</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.eventForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="eventName">Nome do Evento</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                placeholder="Ex: Churrasco do fim de semana"
                value={eventName}
                onChange={handleInputChange}
                maxLength={50}
                disabled={isLoading}
                required
              />
              <small className={styles.charCounter}>
                {eventName.length}/50 caracteres
              </small>
            </div>

            <div className={styles.formTips}>
              <h3>💡 Dicas para um bom nome:</h3>
              <ul>
                <li>Seja específico e descritivo</li>
                <li>Inclua local ou data se relevante</li>
                <li>Mantenha simples e fácil de lembrar</li>
              </ul>
            </div>

            <button
              type="submit"
              className={styles.createBtn}
              disabled={isLoading || eventName.length < 3}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Criando evento...</span>
                </>
              ) : (
                <>
                  <span>Criar Evento</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;

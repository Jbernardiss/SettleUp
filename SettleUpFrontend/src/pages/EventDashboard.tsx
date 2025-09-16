import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Share2 } from 'lucide-react';
import { useEvent } from '../hooks/useEvent';
import { useShare } from '../hooks/useShare';
import { type EventData } from '../types/events';
import styles from '../styles/EventDashboard.module.css';

// Este é um exemplo de como integrar as funcionalidades criadas
// em uma tela principal/dashboard do SettleUp

const EventDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getAllEvents } = useEvent();
  const { shareContent } = useShare();
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    // Carregar eventos salvos
    const savedEvents = getAllEvents();
    setEvents(savedEvents);
  }, []);

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleEventClick = (event: EventData) => {
    // Navegar para detalhes do evento
    navigate(`/invite-qr?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`);
  };

  const handleShareEvent = async (event: EventData, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegar para o evento
    
    await shareContent({
      title: `Convite - ${event.name}`,
      text: `Você foi convidado para o evento "${event.name}" no SettleUp!`,
      url: `https://settleup.app/join/${event.id}`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Meus Eventos</h1>
          <p>Gerencie seus eventos e divida gastos</p>
        </div>
        
        <button 
          className={styles.createBtn}
          onClick={handleCreateEvent}
        >
          <Plus size={20} />
          <span>Criar Evento</span>
        </button>
      </header>

      <main className={styles.main}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Calendar size={64} />
            </div>
            <h2>Nenhum evento ainda</h2>
            <p>Crie seu primeiro evento para dividir gastos com amigos</p>
            <button 
              className={styles.emptyBtn}
              onClick={handleCreateEvent}
            >
              <Plus size={20} />
              <span>Criar Primeiro Evento</span>
            </button>
          </div>
        ) : (
          <div className={styles.eventGrid}>
            {events.map((event) => (
              <div 
                key={event.id}
                className={styles.eventCard}
                onClick={() => handleEventClick(event)}
              >
                <div className={styles.eventHeader}>
                  <div className={styles.eventIcon}>
                    <Calendar size={24} />
                  </div>
                  <button 
                    className={styles.shareBtn}
                    onClick={(e) => handleShareEvent(event, e)}
                    title="Compartilhar evento"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
                
                <div className={styles.eventContent}>
                  <h3>{event.name}</h3>
                  <div className={styles.eventMeta}>
                    <span className={styles.eventId}>ID: {event.id}</span>
                    <span className={styles.eventDate}>
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  
                  <div className={styles.eventStats}>
                    <div className={styles.stat}>
                      <Users size={16} />
                      <span>{event.participants.length} participantes</span>
                    </div>
                    <div className={styles.stat}>
                      <span>{event.expenses.length} gastos</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.eventFooter}>
                  <span className={styles.viewDetails}>Ver detalhes →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventDashboard;
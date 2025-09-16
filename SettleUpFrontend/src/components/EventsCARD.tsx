import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EventData } from '../hooks/useEvents';

type EventsCARDProps = {
  event: EventData;
};

export const EventsCARD: React.FC<EventsCARDProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/event-detail/${event.id}`);
  };

  return (
    // Adicionado cor de fundo e borda para o card individual
    <div
      onClick={handleClick}
      // className="rounded-lg border border-pink-500 bg-gray-800 p-4 shadow-md cursor-pointer hover:shadow-lg hover:bg-gray-700 transition-all"
    >
      <h3 className="text-xl font-bold">{event.name}</h3>
      <p>Total: R$ {event.total_amount}</p>
      <p>Membros: {event.members.length}</p>
      <p>Status: <span className="font-semibold">{event.status}</span></p>
    </div>
  );
};
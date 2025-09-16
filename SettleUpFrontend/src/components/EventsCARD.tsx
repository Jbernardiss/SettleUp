import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Event } from '../types/events'

type EventsCARDProps = {
  event: Event & { id: string }; // Adicionando 'id' ao tipo do evento
};

export const EventsCARD: React.FC<EventsCARDProps> = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/event-details/${event.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-lg border border-pink-500 bg-gray-800 p-4 shadow-md cursor-pointer hover:shadow-lg hover:bg-gray-700 transition-all"
    >
      <h3 className="text-xl font-bold">{event.name}</h3>
      <p>Total: R$ {event.totalAmount}</p>
      <p>Membros: {event.members.length}</p>
      <p>Status: <span className="font-semibold">{event.status}</span></p>
    </div>
  );
};
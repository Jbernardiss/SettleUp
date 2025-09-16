import React from 'react';
import { useParams } from 'react-router-dom';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Detalhes do Evento</h1>
      <p className="mt-4">ID do Evento: {id}</p>
    </div>
  );
};
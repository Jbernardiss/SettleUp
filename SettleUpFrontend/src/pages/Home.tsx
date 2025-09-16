import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, EventsCARD } from "../components/index";
import type { EventData } from "../hooks/useEvents";

const mockEvents: EventData[] = [
    {
      id: '1',
      name: 'Churrasco de Fim de Ano',
      members: ['Alice', 'Beto', 'Carla'],
      expenses: [],
      total_amount: '350.00',
      status: 'OPEN',
    },
    {
      id: '2',
      name: 'Viagem para a Praia',
      members: ['Daniel', 'Eduarda', 'Fernanda', 'Gabriel'],
      expenses: [],
      total_amount: '1250.50',
      status: 'OPEN',
    },
    {
      id: '3',
      name: 'Festa de Aniversário',
      members: ['Heitor', 'Julia'],
      expenses: [],
      total_amount: '500.00',
      status: 'CLOSED',
    },
];


export const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const events = mockEvents;
  const isLoading = false;
  const error = null;

  const handleLoginClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleNotificacoesClick = useCallback(() => {
    navigate("/notificacoes");
  }, [navigate]);

  const handleCarteiraClick = useCallback(() => {
    navigate("/carteira");
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen flex-col items-center py-12">
      <h1 className="text-center text-5xl mb-8">Welcome to the Home page!</h1>
      
      {/* Container com cor de fundo ajustada para maior contraste */}
      <div className="mt-8 w-full max-w-4xl rounded-lg border border-gray-600 bg-gray-700 p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-white">Meus Eventos</h2>
        {isLoading && <p>Carregando eventos...</p>}
        {error && <p className="text-red-500">Erro ao carregar eventos.</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.map(event => (
            <EventsCARD key={event.id} event={event} />
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-10 gap-10">
        <Button onClick={handleLoginClick} text="Login" variant="primary" />
        <Button
          onClick={handleNotificacoesClick}
          text="Notificações"
          variant="secondary"
        />
        <Button
          onClick={handleCarteiraClick}
          text="Carteira Digital"
          variant="tertiary"
        />
      </div>
    </div>
  );
};
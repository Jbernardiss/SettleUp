import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Definindo o tipo para o status do evento como uma união de strings
export type EventStatus = 'OPEN' | 'CLOSED' | 'PENDING';

export type EventData = {
  id: string;
  name: string;
  members: string[];
  expenses: string[];
  total_amount: string;
  status: EventStatus; // Usando o tipo de união de strings
};

// Função para buscar os eventos da API
const fetchEvents = async (): Promise<EventData[]> => {
  // Substitua pela URL real do seu endpoint
  const { data } = await axios.get('https://api.example.com/events');
  return data;
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });
};
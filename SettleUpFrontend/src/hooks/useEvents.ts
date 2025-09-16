import { useState, useEffect, useCallback } from 'react';

export interface SettlementTransaction {
  from: string; 
  to: string; 
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  origin: string; 
  createdAt: any; 
}

export interface EventData {
  id: string;
  name: string;
  members: string[];
  expenses: string[];
  totalAmount: number;
  status: 'PENDING' | 'ACTIVE' | 'FINISHED'; 
  finalBalances?: { [memberId: string]: number }; 
}

const fetchExpenseById = async (expenseId: string): Promise<Expense> => {
  const response = await fetch(`/api/expenses/${expenseId}`); 
  if (!response.ok) {
    throw new Error(`Failed to fetch expense ${expenseId}`);
  }
  return response.json();
};

export const useEvents = (eventId: string | undefined) => {
  const [event, setEvent] = useState<EventData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventData = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    try {
      const eventResponse = await fetch(`/api/events/${eventId}/get_event`);
      if (!eventResponse.ok) {
        throw new Error('Event not found.');
      }
      const eventData: EventData = await eventResponse.json();
      setEvent(eventData);

      if (eventData.expenses && eventData.expenses.length > 0) {
        const expensePromises = eventData.expenses.map(fetchExpenseById);
        const resolvedExpenses = await Promise.all(expensePromises);
        setExpenses(resolvedExpenses);
      } else {
        setExpenses([]); 
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  return { event, expenses, isLoading, error, refresh: fetchEventData };
};

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type Event } from '../types/events';

// A função para buscar os eventos agora aceita um userId
export const fetchEventsByUserId = async (userId: string | undefined): Promise<Event[]> => {
  if (!userId) {
    // Retorna um array vazio se não houver userId, para evitar erros.
    return [];
  }
  // A URL agora aponta para o endpoint correto da sua API
  const { data } = await axios.get(`/api/events/${userId}/get_user_events`);
  return data || []; // Retorna um array vazio se a resposta for nula
};

// O hook agora depende do userId para refazer a busca quando ele mudar
export const useUserEvents = (userId: string | undefined) => {
  return useQuery({
    // A queryKey inclui o userId para que o React Query armazene os dados corretamente
    queryKey: ['events', userId],
    // A queryFn agora chama a função com o userId
    queryFn: () => fetchEventsByUserId(userId),
    // A query só será executada se o userId não for nulo
    enabled: !!userId,
  });
};

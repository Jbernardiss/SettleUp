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


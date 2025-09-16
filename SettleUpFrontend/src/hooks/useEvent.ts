import { useState, useCallback } from 'react';
import { type EventData, type CreateEventData } from '../types/events';

interface UseEventReturn {
  createEvent: (data: CreateEventData) => Promise<EventData>;
  getEvent: (id: string) => EventData | null;
  updateEvent: (id: string, data: Partial<EventData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getAllEvents: () => EventData[];
  isLoading: boolean;
  error: string | null;
}

export const useEvent = (): UseEventReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEventId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createEvent = useCallback(async (data: CreateEventData): Promise<EventData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const eventData: EventData = {
        id: generateEventId(),
        name: data.name,
        description: data.description,
        location: data.location,
        endDate: data.endDate,
        createdAt: new Date().toISOString(),
        participants: [],
        expenses: []
      };
      
      // Salvar no localStorage (em produção seria uma chamada de API)
      const events = JSON.parse(localStorage.getItem('settleup_events') || '[]');
      events.push(eventData);
      localStorage.setItem('settleup_events', JSON.stringify(events));
      localStorage.setItem('settleup_current_event', JSON.stringify(eventData));
      
      return eventData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar evento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEvent = useCallback((id: string): EventData | null => {
    try {
      const events = JSON.parse(localStorage.getItem('settleup_events') || '[]');
      return events.find((event: EventData) => event.id === id) || null;
    } catch (err) {
      setError('Erro ao buscar evento');
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, data: Partial<EventData>): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const events = JSON.parse(localStorage.getItem('settleup_events') || '[]');
      const eventIndex = events.findIndex((event: EventData) => event.id === id);
      
      if (eventIndex === -1) {
        throw new Error('Evento não encontrado');
      }
      
      events[eventIndex] = { ...events[eventIndex], ...data };
      localStorage.setItem('settleup_events', JSON.stringify(events));
      
      // Atualizar evento atual se for o mesmo
      const currentEvent = JSON.parse(localStorage.getItem('settleup_current_event') || 'null');
      if (currentEvent && currentEvent.id === id) {
        localStorage.setItem('settleup_current_event', JSON.stringify(events[eventIndex]));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const events = JSON.parse(localStorage.getItem('settleup_events') || '[]');
      const filteredEvents = events.filter((event: EventData) => event.id !== id);
      localStorage.setItem('settleup_events', JSON.stringify(filteredEvents));
      
      // Remover do evento atual se for o mesmo
      const currentEvent = JSON.parse(localStorage.getItem('settleup_current_event') || 'null');
      if (currentEvent && currentEvent.id === id) {
        localStorage.removeItem('settleup_current_event');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar evento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllEvents = useCallback((): EventData[] => {
    try {
      return JSON.parse(localStorage.getItem('settleup_events') || '[]');
    } catch (err) {
      setError('Erro ao buscar eventos');
      return [];
    }
  }, []);

  return {
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    getAllEvents,
    isLoading,
    error
  };
};
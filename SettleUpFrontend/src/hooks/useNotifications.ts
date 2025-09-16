import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllNotifications, answerEventNotification, answerExpenseNotification } from '../services/nodifications';

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useNotifications = (userId: string, pollingInterval: number = 5000): UseNotificationsReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getAllNotifications(userId),
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: true,
    staleTime: 0,
    enabled: !!userId,
  });

  return {
    notifications: data || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
};
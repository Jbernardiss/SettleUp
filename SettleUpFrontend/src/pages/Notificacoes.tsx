import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components';
import { useNotifications } from '../hooks/useNotifications';
import { answerEventNotification, answerExpenseNotification } from '../services/nodifications';
import { useFreighterWallet } from '../contexts/FreighterWalletContext';

type NotificationResponse = {
  id: string;
  response: string;
  type: string;
};

const sendNotificationResponse = async ({ id, response, type }: NotificationResponse) => {
  if (type === 'fechamento do evento') {
    return await answerEventNotification(id, response);
  } else {
    return await answerExpenseNotification(id, response);
  }
};

export const Notificacoes: React.FC = () => {
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<{[key: string]: {destination: string, amount: string, memo: string}}>({});
  const { notifications, loading, error, refetch } = useNotifications();
  const queryClient = useQueryClient();
  const { makeTransaction } = useFreighterWallet();

  const mutation = useMutation({
    mutationFn: sendNotificationResponse,
    onSuccess: (data, variables) => {
      console.log('Resposta enviada com sucesso:', data);
      setLocalNotifications((current) =>
        current.filter((notification) => notification.id !== variables.id)
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao enviar a resposta da notificação:', error);
    },
  });

  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const handleResponse = async (id: string, response: string, type: string) => {
    if (type === 'fechamento do evento' && response === 'pago') {
      const txData = transactionData[id];
      if (!txData?.destination || !txData?.amount) {
        alert("Destination and amount are required for payment.");
        return;
      }
      
      const result = await makeTransaction({ 
        destinationId: txData.destination, 
        amount: txData.amount, 
        memo: txData.memo || 'Event payment' 
      });
      
      if (result?.success) {
        alert(`✅ Payment transaction submitted! Hash: ${result.hash}`);
        mutation.mutate({ id, response, type });
      } else {
        alert(`❌ Payment transaction failed: ${result?.error}`);
        return;
      }
    } else {
      mutation.mutate({ id, response, type });
    }
  };

  const updateTransactionData = (notificationId: string, field: string, value: string) => {
    setTransactionData(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="container mx-auto p-4">Carregando notificações...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Erro ao carregar notificações: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notificações</h1>
      <div className="space-y-4">
        {localNotifications.length > 0 ? (
          localNotifications.map((notification) => (
            <div key={notification.id} className="border rounded-lg p-4 shadow-md">
              <p className="mb-4">{notification.message}</p>
              
              {notification.type === 'fechamento do evento' && (
                <div className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold text-sm">Payment Details:</h4>
                  <input
                    className="w-full rounded border p-2 text-sm"
                    placeholder="Destination account ID"
                    value={transactionData[notification.id]?.destination || ''}
                    onChange={(e) => updateTransactionData(notification.id, 'destination', e.target.value)}
                  />
                  <input
                    className="w-full rounded border p-2 text-sm"
                    placeholder="Amount (XLM)"
                    value={transactionData[notification.id]?.amount || ''}
                    onChange={(e) => updateTransactionData(notification.id, 'amount', e.target.value)}
                  />
                  <input
                    className="w-full rounded border p-2 text-sm"
                    placeholder="Memo (optional)"
                    value={transactionData[notification.id]?.memo || ''}
                    onChange={(e) => updateTransactionData(notification.id, 'memo', e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                {notification.type === 'compra' && (
                  <>
                    <Button onClick={() => handleResponse(notification.id, 'aceitou', notification.type)} text="Aceitou" variant="primary" disabled={mutation.isPending}/>
                    <Button onClick={() => handleResponse(notification.id, 'recusou', notification.type)} text="Recusou" variant="tertiary" disabled={mutation.isPending}/>
                  </>
                )}
                {notification.type === 'fechamento do evento' && (
                  <Button onClick={() => handleResponse(notification.id, 'pago', notification.type)} text="Pagar" variant="secondary" disabled={mutation.isPending}/>
                )}
                {notification.type === 'convite' && (
                  <>
                    <Button onClick={() => handleResponse(notification.id, 'aceitou', notification.type)} text="Aceitar" variant="primary" disabled={mutation.isPending}/>
                    <Button onClick={() => handleResponse(notification.id, 'recusou', notification.type)} text="Recusar" variant="tertiary" disabled={mutation.isPending}/>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Você não tem novas notificações.</p>
        )}
        {mutation.isPending && (
          <div className="text-center mt-4">Enviando resposta...</div>
        )}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import axios from 'axios';
// Removido 'useQueryClient' pois não está sendo usado
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components';

const initialNotifications = [
  {
    id: 1,
    type: 'compra',
    message: 'Usuário "John Doe" solicitou para entrar no grupo "Viagem para a praia".',
  },
  {
    id: 2,
    type: 'fechamento do evento',
    message: 'O evento "Churrasco de Fim de Ano" foi fechado. Total a pagar: R$ 50,00.',
  },
  {
    id: 4,
    type: 'convite',
    message: 'Você foi convidado para o grupo "Amigos do Futebol".',
  },
];

type NotificationResponse = {
  id: number;
  response: string;
};

const sendNotificationResponse = async ({ id, response }: NotificationResponse) => {
  const { data } = await axios.post(
    `https://sua-api.com/api/notifications/${id}/respond`,
    { response }
  );
  return data;
};

export const Notificacoes: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const mutation = useMutation({
    mutationFn: sendNotificationResponse,
    onSuccess: (data, variables) => {
      console.log('Resposta enviada com sucesso:', data);
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.id !== variables.id)
      );
    },
    onError: (error) => {
      console.error('Erro ao enviar a resposta da notificação:', error);
    },
  });

  const handleResponse = (id: number, response: string) => {
    mutation.mutate({ id, response });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notificações</h1>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className="border rounded-lg p-4 shadow-md">
              <p className="mb-4">{notification.message}</p>
              <div className="flex justify-end space-x-2">
                {notification.type === 'compra' && (
                  <>
                    <Button onClick={() => handleResponse(notification.id, 'aceitou')} text="Aceitou" variant="primary" />
                    <Button onClick={() => handleResponse(notification.id, 'recusou')} text="Recusou" variant="tertiary" />
                  </>
                )}
                {notification.type === 'fechamento do evento' && (
                  <Button onClick={() => handleResponse(notification.id, 'pago')} text="Pagar" variant="secondary" />
                )}
                {notification.type === 'convite' && (
                  <>
                    <Button onClick={() => handleResponse(notification.id, 'aceitou')} text="Aceitar" variant="primary" />
                    <Button onClick={() => handleResponse(notification.id, 'recusou')} text="Recusar" variant="tertiary" />
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
import React, { useState, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components";
import { useNotifications } from "../hooks/useNotifications";
import { useFreighterWallet } from "../contexts/FreighterWalletContext";
import type {
  Notification,
  NotificationStatus,
} from "../types/notifications"; // Import the backend model types

// Define the type for the mutation's input variables
type answerExpenseNotificationParams = {
  expenseId: string;
  status: NotificationStatus;
};

export const answerExpense = async ({
  expenseId,
  status,
}: {
  expenseId: string;
  status: NotificationStatus;
}) => {
  const response = await fetch(`/notifications/answer-expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expenseId, status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to answer expense notification.");
  }

  return response.json();
};

export const Notificacoes: React.FC = () => {
  const { publicKey, makeTransaction } = useFreighterWallet();
  const queryClient = useQueryClient();

  // Use the new Notification type for state
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  // Memo has been removed from the transactionData state
  const [transactionData, setTransactionData] = useState<{
    [key: string]: { destination: string; amount: string };
  }>({});

  // Fetch notifications using the custom hook
  const {
    notifications,
    loading,
    error,
    refetch,
  } = useNotifications(publicKey ?? "");

  // Update the mutation to use the new service and expect the new parameters
  const mutation = useMutation({
    mutationFn: (params: answerExpenseNotificationParams) => answerExpense(params),
    onSuccess: (data, variables) => {
      console.log("Response sent successfully:", data);
      // Optimistically remove the notification from the UI
      setLocalNotifications((current) =>
        current.filter((n) => n.expenseId !== variables.expenseId)
      );
      queryClient.invalidateQueries({ queryKey: ["notifications", publicKey] });
    },
    onError: (error) => {
      console.error("Error sending notification response:", error);
      alert(`Error: ${error.message}`);
    },
  });

  // Effect to sync fetched notifications with local state
  useEffect(() => {
    if (notifications) {
      // Filter out notifications that are not pending for user action
      const actionableNotifications = notifications.filter(
        (n: Notification) => n.status === "PENDING"
      );
      setLocalNotifications(actionableNotifications);

      // Pre-fill transaction data for final payment notifications
      actionableNotifications.forEach((n) => {
        if (n.type === "FINAL" && n.amount && n.amount < 0) {
          updateTransactionData(
            n.id,
            "destination",
             n.origin // Assume payment goes to the event creator/origin
          );
          updateTransactionData(n.id, "amount", Math.abs(n.amount).toString());
        }
      });
    }
  }, [notifications]);

  // Handler for 'EXPENSE' notifications
  const handleExpenseResponse = (
    expenseId: string,
    status: NotificationStatus
  ) => {
    mutation.mutate({ expenseId, status });
  };

  // Handler for making payments for 'FINAL' notifications
  const handlePayment = async (notificationId: string) => {
    const txData = transactionData[notificationId];
    if (!txData?.destination || !txData?.amount) {
      alert("Destination and amount are required for payment.");
      return;
    }

    const result = await makeTransaction({
      destinationId: txData.destination,
      amount: txData.amount,
      // memo is no longer passed
    });

    if (result?.success) {
      alert(`✅ Payment transaction submitted! Hash: ${result.hash}`);
      // After successful payment, remove the notification from view.
      // In a real app, you might call another service to mark it as 'paid'.
      setLocalNotifications((current) =>
        current.filter((n) => n.id !== notificationId)
      );
    } else {
      alert(`❌ Payment transaction failed: ${result?.error}`);
    }
  };

  // Helper to manage transaction form state
  const updateTransactionData = (
    notificationId: string,
    field: "destination" | "amount",
    value: string
  ) => {
    setTransactionData((prev) => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        [field]: value,
      },
    }));
  };

  // Memoized helper to generate dynamic messages for notifications
  const getNotificationMessage = useMemo(
    () => (notification: Notification): string => {
      const originShort = `...${notification.origin.slice(-6)}`;
      switch (notification.type) {
        case "EXPENSE":
          return `User ${originShort} wants to add an expense of ${notification.amount} XLM to event ${notification.eventId.slice(0, 8)}...`;
        case "FINAL":
          if (notification.amount && notification.amount < 0) {
            return `Event ${notification.eventId.slice(0, 8)}... is settled. You need to pay ${Math.abs(notification.amount).toFixed(2)} XLM.`;
          }
          return `Event ${notification.eventId.slice(0, 8)}... is settled. You will receive ${notification.amount?.toFixed(2) ?? 0} XLM. No action is needed.`;
        default:
          return "You have a new notification.";
      }
    },
    []
  );

  if (loading) return <div className="p-4">Loading notifications...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {localNotifications.length > 0 ? (
          localNotifications.map((notification) => (
            <div
              key={notification.id}
              className="border rounded-lg p-4 shadow-md bg-white"
            >
              <p className="mb-4">{getNotificationMessage(notification)}</p>

              {/* Payment Form for FINAL notifications where user owes money */}
              {notification.type === "FINAL" &&
                notification.amount &&
                notification.amount < 0 && (
                  <div className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                    <h4 className="font-semibold text-sm">Payment Details:</h4>
                    {/* Inputs are now controlled and pre-filled */}
                    <input readOnly value={transactionData[notification.id]?.destination || ""} className="w-full rounded border p-2 text-sm bg-gray-200" />
                    <input readOnly value={transactionData[notification.id]?.amount || ""} className="w-full rounded border p-2 text-sm bg-gray-200" />
                    {/* The input for memo has been removed */}
                  </div>
                )}

              <div className="flex justify-end space-x-2">
                {/* Actions for EXPENSE notifications */}
                {notification.type === "EXPENSE" && (
                  <>
                    <Button onClick={() => handleExpenseResponse(notification.expenseId, "ACCEPTED")} text="Accept" variant="primary" disabled={mutation.isPending} />
                    <Button onClick={() => handleExpenseResponse(notification.expenseId, "REFUSED")} text="Refuse" variant="tertiary" disabled={mutation.isPending} />
                  </>
                )}

                {notification.type === "FINAL" &&
                  notification.amount &&
                  notification.amount < 0 && (
                    <Button onClick={() => handlePayment(notification.id)} text="Pay" variant="secondary" disabled={false} />
                  )}
              </div>
            </div>
          ))
        ) : (
          <p>You have no new notifications.</p>
        )}
        {mutation.isPending && (
          <div className="text-center mt-4">Sending response...</div>
        )}
      </div>
    </div>
  );
};
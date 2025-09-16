import axios from "axios";

interface Notification {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

export const getAllNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await axios.get<Notification[]>(`/${userId}/notifications/get`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const answerEventNotification = async (eventId: string, answer: any): Promise<any> => {
  try {
    const response = await axios.post(`/${eventId}/notifications/answer_event`, answer);
    return response.data;
  } catch (error) {
    console.error("Error answering event notification:", error);
    throw error;
  }
};

export const answerExpenseNotification = async (eventId: string, answer: any): Promise<any> => {
  try {
    const response = await axios.post(`/${eventId}/notifications/answer_expense`, answer);
    return response.data;
  } catch (error) {
    console.error("Error answering expense notification:", error);
    throw error;
  }
};

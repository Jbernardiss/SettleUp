import axios from "axios";

export const postEventUser = async (eventId: string, userId: string): Promise<Notification[]> => {
  try {
    const response = await axios.post<Notification[]>(
      `/${eventId}/add_user`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};


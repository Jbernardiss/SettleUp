import axios from "axios";

export const putEventUser = async (
  eventId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await axios.put(`/${eventId}/add_user`, { userId });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const postEvent = async (
  name: string,
  userId: string
): Promise<{ eventId: string }> => {
  try {
    const response = await axios.post<{ eventId: string }>(`/events/create`, {
      name,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

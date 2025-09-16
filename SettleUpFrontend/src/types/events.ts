export interface EventData {
  id: string;
  name: string;
  createdAt: string;
  participants: Participant[];
  expenses: Expense[];
  description?: string;
  location?: string;
  endDate?: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  joinedAt: string;
  isAdmin: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // participant id
  splitBetween: string[]; // participant ids
  category?: string;
  description?: string;
  date: string;
  receipt?: string; // file url
}

export interface CreateEventData {
  name: string;
  description?: string;
  location?: string;
  endDate?: string;
}

export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
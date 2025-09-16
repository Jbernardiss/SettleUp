type NotificationType = 'EXPENSE' | 'FINAL';
type NotificationStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED'
import { Timestamp } from 'firebase-admin/firestore'

type Notification = {
    id: string;
    destination: string;
    eventId: string;
    expenseId: string;
    origin: string;
    status: boolean;
    type: NotificationType;
    settlement: { from: string, to: string, amount: number }
    createdAt: Timestamp
}

export { Notification, NotificationType, NotificationStatus }

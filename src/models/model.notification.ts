type NotificationType = 'EVENT' | 'EXPENSE' | 'FINAL';
type NotificationStatus = 'PENDING' | 'ACCEPTED' | 'REFUSED'

type Notification = {
    destination: string;
    eventId: string;
    expenseId: string;
    origin: string;
    status: boolean;
    type: NotificationType;
}

export { Notification, NotificationType, NotificationStatus }

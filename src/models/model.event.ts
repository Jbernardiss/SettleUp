type EventStatus = 'PENDING' | 'FINISHED' | 'ONGOING';

type Event = {
    name: string;
    members: string[];
    expenses: string[];
    totalAmount: number;
    nInvitations: number;
    nResponses: number;
    status: EventStatus;
}

export { Event, EventStatus };

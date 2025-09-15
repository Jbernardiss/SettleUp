type EventStatus = 'PENDING' | 'FINISHED' | 'ONGOING';

type Event = {
    name: string;
    members: string[];
    total_amount: number;
    expenses: string[];
    status: EventStatus;
}

export { Event, EventStatus };

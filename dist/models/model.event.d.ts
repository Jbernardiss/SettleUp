type EventStatus = 'PENDING' | 'FINISHED' | 'ONGOING';
type Event = {
    id: string;
    name: string;
    members: string[];
    expenses: string[];
    totalAmount: number;
    nInvitations: number;
    nResponses: number;
    status: EventStatus;
};
export { Event, EventStatus };
//# sourceMappingURL=model.event.d.ts.map
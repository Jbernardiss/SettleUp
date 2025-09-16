import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEvents, type Expense, type SettlementTransaction } from '../hooks/useEvents';
import { Button } from '../components';
import { postEventUser } from '../services';
import { useFreighterWallet } from '../contexts/FreighterWalletContext';

export const EventDetail: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const inviteParam = searchParams.get('invite');
  const { event, expenses, isLoading, error, refresh } = useEvents(eventId);
  const {publicKey} = useFreighterWallet();

  const [settlementPlan, setSettlementPlan] = useState<SettlementTransaction[] | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinishEvent = async () => {
    if (!eventId) return;

    const confirmation = window.confirm(
      'Are you sure you want to finish and settle this event? This action cannot be undone.'
    );
    if (!confirmation) return;

    setIsFinishing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/finish`, { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to finish event.');
      }
      
      setSettlementPlan(result.settlement);
      alert('✅ Event settled successfully! See the plan below.');
      refresh(); 

    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    if(inviteParam) postEventUser(eventId ?? '', publicKey ?? '')
  }, [])

  if (isLoading) return <div className="text-center p-10">Loading event details...</div>;
  if (error) return <div className="text-center text-red-500 p-10">Error: {error}</div>;
  if (!event) return <div className="text-center p-10">Event not found.</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Event Header */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">{event.name}</h1>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            event.status === 'ACTIVE' ? 'bg-green-200 text-green-800' : 
            event.status === 'FINISHED' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
          }`}>
            {event.status}
          </span>
        </div>
        <p className="text-gray-600 mt-2">Total Spent: <span className="font-bold text-xl">R$ {event.totalAmount.toFixed(2)}</span></p>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Render Settlement Plan if Event is FINISHED */}
        {event.status === 'FINISHED' && (
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-500">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">Final Settlement Plan 💰</h2>
            {settlementPlan && settlementPlan.length > 0 ? (
              <ul className="space-y-3">
                {settlementPlan.map((txn, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-mono text-sm truncate" title={txn.from}>Payer: ...{txn.from.slice(-8)}</span>
                    <span className="text-lg font-bold mx-4 text-blue-600">→</span>
                    <span className="font-mono text-sm truncate" title={txn.to}>Receiver: ...{txn.to.slice(-8)}</span>
                    <span className="ml-auto pl-4 font-bold text-xl">R$ {txn.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">All debts are settled, or no payments were needed.</p>
            )}
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
          <div className="space-y-4">
            {expenses.length > 0 ? expenses.map((exp: Expense) => (
              <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-semibold">{exp.description}</p>
                  <p className="text-sm text-gray-500 font-mono" title={exp.origin}>Paid by: ...{exp.origin.slice(-8)}</p>
                </div>
                <p className="font-bold text-lg">R$ {exp.amount.toFixed(2)}</p>
              </div>
            )) : <p className="text-gray-500">No expenses added yet.</p>}
          </div>
        </div>

        {event.status === 'ACTIVE' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Settle Up</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will calculate who owes what, generate a payment plan, and close the event.
            </p>
            <Button 
              onClick={handleFinishEvent} 
              text={isFinishing ? "Settling..." : "Finish & Settle Event"} 
              variant="primary"
              disabled={isFinishing} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
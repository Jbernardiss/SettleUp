import { Request, Response } from 'express';
import { db } from '../utils/db'; 
import { v4 as uuidv4 } from 'uuid';
import { Event, EventStatus } from "../models/model.event"
import { Notification, NotificationStatus, NotificationType } from "../models/model.notification"
import * as admin from 'firebase-admin'; 
// const { v4: uuidv4 } = require('uuid')

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params; 

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    const eventRef = db.collection('events').doc(eventId);
    const doc = await eventRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.status(200).json({ id: doc.id,...doc.data() });
  } catch (error) {
    console.error('Error getting event by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve event.' });
  }
};

export const getEventsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; 

    if (!userId) {
      return res.status(400).json({ error: 'User ID (public key) is required.' });
    }

    const eventsRef = db.collection('events');
    const snapshot = await eventsRef.where('members', 'array-contains', userId).get();

    if (snapshot.empty) {
      return res.status(200).json([]); 
    }

    const userEvents: any[] = []; 
    snapshot.forEach(doc => {
      userEvents.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(userEvents);
  } catch (error) {
    console.error('Error getting events by user ID:', error);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, members, origin } = req.body;

    if (!name || !members || !Array.isArray(members) || members.length === 0 ||!origin) {
      return res.status(400).json({ error: 'Event name, a list of members, and an origin public key are required.' });
    }

    const eventId = uuidv4();
    const eventRef = db.collection('events').doc(eventId);
    const batch = db.batch();

    batch.set(eventRef, {
      name: name,
      nInvitations: members.length,
      nResponses: 0,
      totalAmount: 0,
      members: [], 
      expenses: [],
      status: 'PENDING' as EventStatus
    });

    await batch.commit();

    res.status(201).json({ message: 'Event created and notifications sent successfully', eventId: eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const finishEvent = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400).json({ error: 'Event ID is required.' });
    return;
  }

  try {
    const settlementTransactions: { from: string, to: string, amount: number }[] = [];

    await db.runTransaction(async (transaction) => {
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new Error('Event not found.');
      }
      const event = eventDoc.data() as Event;

      if (event.status === 'FINISHED') {
        throw new Error('This event has already been finished.');
      }

      const { members, expenses: expenseIds } = event;
      const balances: { [memberId: string]: number } = {};
      members.forEach((member) => (balances[member] = 0));
      let totalEventCost = 0;

      const expenseRefs = expenseIds.map((id) => db.collection('expenses').doc(id));
      const expenseDocs = await transaction.getAll(...expenseRefs);

      for (const doc of expenseDocs) {
        if (doc.exists) {
          const expense = doc.data() as { amount: number; origin: string; };
          if (expense && typeof expense.amount === 'number' && expense.origin) {
            balances[expense.origin] += expense.amount;
            totalEventCost += expense.amount;
          }
        }
      }

      const sharePerMember = totalEventCost / members.length;
      members.forEach((member) => {
        balances[member] -= sharePerMember;
      });

      const debtors = members.filter((m) => balances[m] < 0).map((m) => ({ id: m, amount: Math.abs(balances[m]) }));
      const creditors = members.filter((m) => balances[m] > 0).map((m) => ({ id: m, amount: balances[m] }));
      
      let debtorIndex = 0;
      let creditorIndex = 0;
      const epsilon = 1e-5;

      while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
        const debtor = debtors[debtorIndex];
        const creditor = creditors[creditorIndex];
        const transferAmount = Math.min(debtor.amount, creditor.amount);

        if (transferAmount > epsilon) {
          settlementTransactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: transferAmount,
          });
          debtor.amount -= transferAmount;
          creditor.amount -= transferAmount;
        }

        if (debtor.amount < epsilon) debtorIndex++;
        if (creditor.amount < epsilon) creditorIndex++;
      }

      for (const memberId of members) {
        const notificationRef = db.collection('notifications').doc();
        
        const userSpecificTransactions = settlementTransactions.filter(
          (t) => t.from === memberId || t.to === memberId
        );

        const finalBalance = balances[memberId];

        const notificationPayload = {
          destination: memberId,
          eventId: eventId,
          expenseId: '',
          origin: 'system',
          status: 'ACCEPTED' as NotificationStatus,
          type: 'FINAL' as NotificationType,
          amount: finalBalance, 
          settlement: userSpecificTransactions,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        transaction.set(notificationRef, notificationPayload);
      }

      transaction.update(eventRef, {
        status: 'FINISHED' as EventStatus,
        finalBalances: balances,
        settlementTransactions: settlementTransactions,
      });
    });

    res.status(200).json({
      message: `Event ${eventId} has been successfully finished.`,
      settlement: settlementTransactions, 
    });

  } catch (error: any) {
    console.error(`Failed to finish event ${eventId}:`, error);
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('already been finished')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }
};
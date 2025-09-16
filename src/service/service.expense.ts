import { Request, Response } from 'express';
import { db } from '../utils/db'; 
import * as StellarSdk from 'stellar-sdk'; 
import * as admin from 'firebase-admin'; 

export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({ error: 'Expense ID (transaction hash) is required.' });
    }

    const expenseRef = db.collection('expenses').doc(expenseId);
    const doc = await expenseRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.status(200).json({ id: doc.id,...doc.data() });
  } catch (error) {
    console.error('Error getting expense by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve expense.' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { eventId, expenseId } = req.body;

    if (!eventId || !expenseId) {
      return res.status(400).json({ error: 'eventId, expenseId (transaction hash), and origin are required.' });
    }

    const eventRef = db.collection('events').doc(eventId);
    const expenseRef = db.collection('expenses').doc(expenseId);
    const notificationsRef = db.collection('notifications');

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const members: string[] = eventDoc.data()?.members || [];
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Event has no members to notify.' });
    }

    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    async function getTransactionData(expense: string): Promise<[string, string]> {
      try {
        const tx = await server.transactions().transaction(expense).call();
        // console.log("Transaction Data:", tx);
        console.log(`Source Account: ${tx.source_account}`)

        let amount;
        const { records: operations } = await tx.operations()
        for (const op of operations) {
          if (op.type === 'payment' && op.asset_type === 'native') {
            amount = op.amount
          }
        }
        if (!amount) {
          throw new Error('Only native payment operations are supported for expenses.');
        }
        return [tx.source_account, amount as string]
      } catch (error) {
        console.error("Error fetching transaction:", error);
        throw new Error('Failed to fetch transaction from Horizon.');
      }
    }

    const [origin, amountStr] = await getTransactionData(expenseId);
    const amount = parseFloat(String(amountStr));
    if (!isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction amount.' });
    }

    const batch = db.batch();

    batch.set(expenseRef, {
      amount: amount,
      event: eventId,
      nAccepted: 0,
      origin: origin,
    });

    members.forEach((memberPublicKey: string) => {
      if (memberPublicKey!== origin) {
        const notificationRef = notificationsRef.doc();
        batch.set(notificationRef, {
          destination: memberPublicKey,
          origin: origin,
          eventId: eventId,
          expenseId: expenseId,
          type: 'EXPENSE',
          status: 'PENDING',
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    await batch.commit();

    res.status(201).json({ message: 'Expense created and notifications sent successfully', expenseId: expenseId });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense.' });
  }
};

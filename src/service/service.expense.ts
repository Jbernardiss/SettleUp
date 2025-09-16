import { Request, Response } from 'express';
import { db } from '../utils/db'; 
import * as StellarSdk from 'stellar-sdk'; 
import * as admin from 'firebase-admin'; 

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
    const members = eventDoc.data()?.members;

    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    async function getTransactionData(expense: string) {
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
        return [tx.source_account, amount]
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    }

    let [origin, amount] = await getTransactionData(expenseId);

    const batch = db.batch();

    batch.set(expenseRef, {
      amount: parseFloat(amount),
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

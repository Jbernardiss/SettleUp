import { NotificationStatus } from '../models/model.notification';
import { db } from '../utils/db';
import { Request, Response } from 'express';
import * as admin from 'firebase-admin'; 

export const getNotificationsByUserId = async(req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID (public key) is required.' });
    }
    
    const notificationsRef = db.collection('notifications');
    
    const snapshot = await notificationsRef.where('destination', '==', userId).get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const userNotifications: any[] = [];
    snapshot.forEach(doc => {
        userNotifications.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(userNotifications);
  } catch (error) {
    console.error('Error getting notifications by user ID:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
}

export const answerExpenseNotification = async (req: Request, res: Response) => {
  try {
    const { expenseId, status } = req.body as { expenseId?: string; status?: NotificationStatus };

    if (!expenseId || !status) {
      return res.status(400).json({ error: 'expenseId (transaction hash) and status are required.' });
    }

    if (status!== 'ACCEPTED' && status!== 'REFUSED') {
      return res.status(400).json({ error: 'Status must be either "ACCEPTED" or "REFUSED".' });
    }

    const expenseRef = db.collection('expenses').doc(expenseId);

    if (status === 'ACCEPTED') {
      await expenseRef.update({
        nAccepted: admin.firestore.FieldValue.increment(1)
      });

      const updatedExpenseDoc = await expenseRef.get();
      if (!updatedExpenseDoc.exists) {
        return res.status(404).json({ error: 'Expense document not found after update.' });
      }

      const { nAccepted, event: eventId, amount } = updatedExpenseDoc.data()!;
      
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return res.status(404).json({ error: 'Associated event not found.' });
      }

      const members = eventDoc.data()?.members || [];
      const requiredAcceptances = Math.floor(members.length / 2); 

      if (nAccepted > requiredAcceptances) {
        await eventRef.update({
          expenses: admin.firestore.FieldValue.arrayUnion(expenseId),
          totalAmount: admin.firestore.FieldValue.increment(amount)
        });

        // Add informational notifications to members about accepted expense
        const notificationsRef = db.collection('notifications');
        for (const member of members) {
          if (member === updatedExpenseDoc.data()!.origin) continue;
          const notificationRef = notificationsRef.doc();
          await notificationRef.set({
            destination: member,
            origin: updatedExpenseDoc.data()!.origin,
            eventId: eventId,
            expenseId: expenseId,
            type: 'EXPENSE',
            status: 'ACCEPTED',
            message: 'Expense accepted and added to event total',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    res.status(200).json({ message: `Successfully processed '${status}' response for expense ${expenseId}` });
  } catch (error) {
    console.error('Error answering expense notification:', error);
    res.status(500).json({ error: 'Failed to process expense response.' });
  }
};

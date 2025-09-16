import { NotificationStatus } from '@/models/model.notification';
import { db } from '../utils/db';
import { Request, Response } from 'express';
import { EventStatus } from '@/models/model.event';
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
      return res.status(200).json();
    }

    let userNotifications: any;
    snapshot.forEach(doc => {
        userNotifications.push({ id: doc.id,...doc.data() });
    });

    res.status(200).json(userNotifications);
  } catch (error) {
    console.error('Error getting notifications by user ID:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
}

export const answerEventNotification = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { publicKey, status } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'User public key is required.' });
    }

    const eventRef = db.collection('events').doc(eventId);

    if (status == "ACCEPTED" as NotificationStatus)
      await eventRef.update({
        members: admin.firestore.FieldValue.arrayUnion(publicKey)
      });

    const doc = await eventRef.get();
    let { nInvitations, nResponses } = doc.data(); 
    if (nInvitations == nResponses)
      await eventRef.update({
        status: "ONGOING" as EventStatus
      });

    res.status(200).json({ message: `User ${publicKey} added to event ${eventId}.` });
  } catch (error) {
    console.error('Error adding user to event:', error);
    res.status(500).json({ error: 'Failed to add user.' });
  }
};

export const answerExpenseNotification = async (req: Request, res: Response) => {
  try {
    const { expenseId, status } = req.body;

    if (!expenseId || !status) {
      return res.status(400).json({ error: 'expenseId (transaction hash) and status are required.' });
    }

    if (status!== 'ACCEPTED' && status!== 'REJECTED') {
      return res.status(400).json({ error: 'Status must be either "ACCEPTED" or "REJECTED".' });
    }

    const expenseRef = db.collection('expenses').doc(expenseId);

    if (status === "ACCEPTED" as NotificationStatus) {
      await expenseRef.update({
        nAccepted: admin.firestore.FieldValue.increment(1)
      });

      const updatedExpenseDoc = await expenseRef.get();
      if (!updatedExpenseDoc.exists) {
        return res.status(404).json({ error: 'Expense document not found after update.' });
      }

      const { nAccepted, event: eventId } = updatedExpenseDoc.data()!;
      
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return res.status(404).json({ error: 'Associated event not found.' });
      }

      const members = eventDoc.data()?.members;
      const requiredAcceptances = Math.floor(members.length / 2); 

      if (nAccepted > requiredAcceptances) {
        await eventRef.update({
          expenses: admin.firestore.FieldValue.arrayUnion(expenseId)
        });
      }
    }

    res.status(200).json({ message: `Successfully processed '${status}' response for expense ${expenseId}` });
  } catch (error) {
    console.error('Error answering expense notification:', error);
    res.status(500).json({ error: 'Failed to process expense response.' });
  }
};

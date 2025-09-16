import { Request, Response } from 'express';
import { db } from '../utils/db'; 
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin'; 
import { Event, EventStatus } from "../models/model.event"
import { Notification, NotificationStatus, NotificationType } from "../models/model.notification"

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
      return res.status(200).json();
    }

    let userEvents: any;
    snapshot.forEach(doc => {
      userEvents.push({ id: doc.id,...doc.data() });
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
    const notificationsRef = db.collection('notifications');

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

    members.forEach((memberPublicKey: string) => {
      if (memberPublicKey !== origin) {
        const notificationRef = notificationsRef.doc(); 
        batch.set(notificationRef, {
          destination: memberPublicKey,
          origin: origin,
          eventId: eventId,
          expenseId: null, 
          type: 'EVENT' as NotificationType,
          status: 'PENDING' as NotificationStatus,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(), 
        });
      }
    });

    await batch.commit();

    res.status(201).json({ message: 'Event created and notifications sent successfully', eventId: eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

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
    const { eventId } = req.params;
    const { transactionHash, status } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ error: 'Transaction hash is required.' });
    }

    const eventRef = db.collection('events').doc(eventId);

    if (status == "ACCEPTED" as NotificationStatus)
      await eventRef.update({
        expenses: admin.firestore.FieldValue.arrayUnion(transactionHash)
      });

    res.status(201).json({ message: 'Expense hash added successfully', transactionHash: transactionHash });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense.' });
  }
};

export const finishEvent = async (req: Request, res: Response) => {

    // Get event via id
    const eventRef = db.collection('events').doc('190wma4uJJME5inVnzaD');
    const doc = await eventRef.get();
    const expenseRef = query(db.collection('expenses'), where('event', '==', '190wma4uJJME5inVnzaD'));
    const event: Event = {
      id: doc.id,
      name: doc.data().name,
      members: doc.data().members,
      expenses: doc.data().expenses,
      finished: doc.data().finished
    }



    // Get transactions data
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

    let expensesData = {}
    for(let expense of event.expenses) {
      expensesData[expense] = getTransactionData(expense)
    }


    let individualTabs = {}
    let individualTransactionsList = {}
    for(let member of event.members) {
        individualTabs[member] = []
        individualTransactionsList[member] = []
    }

    for(let expense of event.expenses) {
        let expenseData = expensesData[expense]
        individualTabs[expenseData[0]].push(-(expenseData[1])); 
    }
    console.log(individualTabs)

    let sum;
    for(let member in individualTabs) {
      sum = 0;
      for(let value of individualTabs[member]) {
        sum += value;
      }
    
      individualTabs[member] = [sum]
    }


    for(let member in individualTabs) {
      const split = individualTabs[member][0]/event.members.length
      individualTabs[member].push(-(individualTabs[member][0] - split))

      for(let otherMember in individualTabs) {
        if (otherMember != member) {
          individualTabs[otherMember].push(split)
          individualTransactionsList[otherMember].push([member, split])
        }
      }
    }

    console.log(individualTransactionsList)
    console.log(individualTabs)


    try {
      const { eventId } = req.params;
      const eventRef = db.collection('events').doc(eventId);

      await eventRef.update({
        finished: true,
      });

      res.status(200).json({ message: `Event ${eventId} has been marked as finished.` });
    } catch (error) {
      console.error('Error finishing event:', error);
      res.status(500).json({ error: 'Failed to finish event.' });
    }

    
    res.send(`Event ${req.params.eventId} finished`);
}

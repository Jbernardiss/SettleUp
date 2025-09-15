import { Request, Response } from 'express';
import { db } from '../utils/db'; 
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin'; 

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
    const { name, members } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'A list of member public keys is required.' });
    }

    const eventId = uuidv4();
    const eventRef = db.collection('events').doc(eventId);

    await eventRef.set({
      name: name,
      members: members, 
      expenses: [], 
      finished: false,
    });

    res.status(201).json({ message: 'Event created successfully', eventId: eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const addUserToEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'User public key is required.' });
    }

    const eventRef = db.collection('events').doc(eventId);
    
    await eventRef.update({
      members: admin.firestore.FieldValue.arrayUnion(publicKey)
    });

    res.status(200).json({ message: `User ${publicKey} added to event ${eventId}.` });
  } catch (error) {
    console.error('Error adding user to event:', error);
    res.status(500).json({ error: 'Failed to add user.' });
  }
};

export const addExpenseToEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ error: 'Transaction hash is required.' });
    }

    const eventRef = db.collection('events').doc(eventId);

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
};

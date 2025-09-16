import { Request, Response } from 'express';
import { db } from '../utils/db'; 
// import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin'; 
import { query, where } from 'firebase/firestore'
import Event from '../models/model.event';
import * as StellarSdk from 'stellar-sdk';


export const getAllEvent = async (req: Request, res: Response) => {

  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events." });
  }

}

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

const supposedEvent: Event = {
    id: '1',
    name: 'Trip to Paris',
    members: [ 'a123', 'b456', 'c789' ],
    expenses: [ 'e1', 'e2', 'e3', /* 'e4' */ ],
    finished: false
}

const mapExpenses = {     // this will have to be built
    'e1': ['a123', 100],
    'e2': ['b456', 50],
    'e3': ['c789', 25],
    // 'e4': ['a123', 50],
}

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

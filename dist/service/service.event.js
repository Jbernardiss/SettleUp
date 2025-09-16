"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishEvent = exports.createEvent = exports.getEventsByUserId = exports.getEventById = void 0;
const db_1 = require("../utils/db");
const uuid_1 = require("uuid");
const admin = __importStar(require("firebase-admin"));
// const { v4: uuidv4 } = require('uuid')
const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ error: 'Event ID is required.' });
        }
        const eventRef = db_1.db.collection('events').doc(eventId);
        const doc = await eventRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.status(200).json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        console.error('Error getting event by ID:', error);
        res.status(500).json({ error: 'Failed to retrieve event.' });
    }
};
exports.getEventById = getEventById;
const getEventsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID (public key) is required.' });
        }
        const eventsRef = db_1.db.collection('events');
        const snapshot = await eventsRef.where('members', 'array-contains', userId).get();
        if (snapshot.empty) {
            return res.status(200).json();
        }
        let userEvents;
        snapshot.forEach(doc => {
            userEvents.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(userEvents);
    }
    catch (error) {
        console.error('Error getting events by user ID:', error);
        res.status(500).json({ error: 'Failed to retrieve events.' });
    }
};
exports.getEventsByUserId = getEventsByUserId;
const createEvent = async (req, res) => {
    try {
        const { name, members, origin } = req.body;
        if (!name || !members || !Array.isArray(members) || members.length === 0 || !origin) {
            return res.status(400).json({ error: 'Event name, a list of members, and an origin public key are required.' });
        }
        const eventId = (0, uuid_1.v4)();
        const eventRef = db_1.db.collection('events').doc(eventId);
        const notificationsRef = db_1.db.collection('notifications');
        const batch = db_1.db.batch();
        batch.set(eventRef, {
            name: name,
            nInvitations: members.length,
            nResponses: 0,
            totalAmount: 0,
            members: [],
            expenses: [],
            status: 'PENDING'
        });
        members.forEach((memberPublicKey) => {
            if (memberPublicKey !== origin) {
                const notificationRef = notificationsRef.doc();
                batch.set(notificationRef, {
                    destination: memberPublicKey,
                    origin: origin,
                    eventId: eventId,
                    expenseId: null,
                    type: 'EVENT',
                    status: 'PENDING',
                    read: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        });
        await batch.commit();
        res.status(201).json({ message: 'Event created and notifications sent successfully', eventId: eventId });
    }
    catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event.' });
    }
};
exports.createEvent = createEvent;
const finishEvent = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
        res.status(400).json({ error: 'Event ID is required.' });
        return;
    }
    try {
        await db_1.db.runTransaction(async (transaction) => {
            const eventRef = db_1.db.collection('events').doc(eventId);
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists) {
                throw new Error('Event not found.');
            }
            const event = eventDoc.data();
            if (event.status === 'FINISHED') {
                throw new Error('This event has already been finished.');
            }
            const { members, expenses: expenseIds } = event;
            const memberCount = members.length;
            if (memberCount === 0) {
                transaction.update(eventRef, { status: 'FINISHED' });
                return;
            }
            const expenseRefs = expenseIds.map((id) => db_1.db.collection('expenses').doc(id));
            const expenseDocs = await transaction.getAll(...expenseRefs);
            const balances = {};
            members.forEach((member) => (balances[member] = 0));
            let totalEventCost = 0;
            for (const doc of expenseDocs) {
                if (doc.exists) {
                    const expense = doc.data();
                    if (expense && typeof expense.amount === 'number' && expense.origin) {
                        balances[expense.origin] += expense.amount;
                        totalEventCost += expense.amount;
                    }
                }
            }
            const sharePerMember = totalEventCost / memberCount;
            members.forEach((member) => {
                balances[member] -= sharePerMember;
            });
            for (const memberId of members) {
                const finalBalance = balances[memberId];
                const notificationRef = db_1.db.collection('notifications').doc();
                const message = finalBalance >= 0
                    ? `Event settled! You get back $${finalBalance.toFixed(2)}.`
                    : `Event settled! You owe $${Math.abs(finalBalance).toFixed(2)}.`;
                const notificationPayload = {
                    destination: memberId,
                    eventId: eventId,
                    expenseId: '',
                    origin: 'system',
                    status: 'ACCEPTED',
                    type: 'FINAL',
                    message: message,
                    amount: finalBalance,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                transaction.set(notificationRef, notificationPayload);
            }
            transaction.update(eventRef, {
                status: 'FINISHED',
                finalBalances: balances,
            });
        });
        res.status(200).json({
            message: `Event ${eventId} has been successfully finished.`,
        });
    }
    catch (error) {
        console.error(`Failed to finish event ${eventId}:`, error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        }
        else if (error.message.includes('already been finished')) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }
};
exports.finishEvent = finishEvent;
//# sourceMappingURL=service.event.js.map
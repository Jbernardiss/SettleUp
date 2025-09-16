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
exports.answerExpenseNotification = exports.answerEventNotification = exports.getNotificationsByUserId = void 0;
const db_1 = require("../utils/db");
const admin = __importStar(require("firebase-admin"));
const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID (public key) is required.' });
        }
        const notificationsRef = db_1.db.collection('notifications');
        const snapshot = await notificationsRef.where('destination', '==', userId).get();
        if (snapshot.empty) {
            return res.status(200).json();
        }
        let userNotifications;
        snapshot.forEach(doc => {
            userNotifications.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(userNotifications);
    }
    catch (error) {
        console.error('Error getting notifications by user ID:', error);
        res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
};
exports.getNotificationsByUserId = getNotificationsByUserId;
const answerEventNotification = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { publicKey, status } = req.body;
        if (!publicKey) {
            return res.status(400).json({ error: 'User public key is required.' });
        }
        const eventRef = db_1.db.collection('events').doc(eventId);
        if (status == "ACCEPTED")
            await eventRef.update({
                members: admin.firestore.FieldValue.arrayUnion(publicKey)
            });
        const doc = await eventRef.get();
        let { nInvitations, nResponses } = doc.data();
        if (nInvitations == nResponses)
            await eventRef.update({
                status: "ONGOING"
            });
        res.status(200).json({ message: `User ${publicKey} added to event ${eventId}.` });
    }
    catch (error) {
        console.error('Error adding user to event:', error);
        res.status(500).json({ error: 'Failed to add user.' });
    }
};
exports.answerEventNotification = answerEventNotification;
const answerExpenseNotification = async (req, res) => {
    try {
        const { expenseId, status } = req.body;
        if (!expenseId || !status) {
            return res.status(400).json({ error: 'expenseId (transaction hash) and status are required.' });
        }
        if (status !== 'ACCEPTED' && status !== 'REJECTED') {
            return res.status(400).json({ error: 'Status must be either "ACCEPTED" or "REJECTED".' });
        }
        const expenseRef = db_1.db.collection('expenses').doc(expenseId);
        if (status === "ACCEPTED") {
            await expenseRef.update({
                nAccepted: admin.firestore.FieldValue.increment(1)
            });
            const updatedExpenseDoc = await expenseRef.get();
            if (!updatedExpenseDoc.exists) {
                return res.status(404).json({ error: 'Expense document not found after update.' });
            }
            const { nAccepted, event: eventId } = updatedExpenseDoc.data();
            const eventRef = db_1.db.collection('events').doc(eventId);
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
    }
    catch (error) {
        console.error('Error answering expense notification:', error);
        res.status(500).json({ error: 'Failed to process expense response.' });
    }
};
exports.answerExpenseNotification = answerExpenseNotification;
//# sourceMappingURL=service.notification.js.map
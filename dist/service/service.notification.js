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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerExpenseNotification = exports.getNotificationsByUserId = void 0;
const db_1 = require("../utils/db");
const admin = __importStar(require("firebase-admin"));
const getNotificationsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID (public key) is required.' });
        }
        const notificationsRef = db_1.db.collection('notifications');
        const snapshot = yield notificationsRef.where('destination', '==', userId).get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const userNotifications = [];
        snapshot.forEach(doc => {
            userNotifications.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json(userNotifications);
    }
    catch (error) {
        console.error('Error getting notifications by user ID:', error);
        res.status(500).json({ error: 'Failed to retrieve notifications.' });
    }
});
exports.getNotificationsByUserId = getNotificationsByUserId;
const answerExpenseNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { expenseId, status } = req.body;
        if (!expenseId || !status) {
            return res.status(400).json({ error: 'expenseId (transaction hash) and status are required.' });
        }
        if (status !== 'ACCEPTED' && status !== 'REFUSED') {
            return res.status(400).json({ error: 'Status must be either "ACCEPTED" or "REFUSED".' });
        }
        const expenseRef = db_1.db.collection('expenses').doc(expenseId);
        if (status === 'ACCEPTED') {
            yield expenseRef.update({
                nAccepted: admin.firestore.FieldValue.increment(1)
            });
            const updatedExpenseDoc = yield expenseRef.get();
            if (!updatedExpenseDoc.exists) {
                return res.status(404).json({ error: 'Expense document not found after update.' });
            }
            const { nAccepted, event: eventId, amount } = updatedExpenseDoc.data();
            const eventRef = db_1.db.collection('events').doc(eventId);
            const eventDoc = yield eventRef.get();
            if (!eventDoc.exists) {
                return res.status(404).json({ error: 'Associated event not found.' });
            }
            const members = ((_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.members) || [];
            const requiredAcceptances = Math.floor(members.length / 2);
            if (nAccepted > requiredAcceptances) {
                yield eventRef.update({
                    expenses: admin.firestore.FieldValue.arrayUnion(expenseId),
                    totalAmount: admin.firestore.FieldValue.increment(amount)
                });
                // Add informational notifications to members about accepted expense
                const notificationsRef = db_1.db.collection('notifications');
                for (const member of members) {
                    if (member === updatedExpenseDoc.data().origin)
                        continue;
                    const notificationRef = notificationsRef.doc();
                    yield notificationRef.set({
                        destination: member,
                        origin: updatedExpenseDoc.data().origin,
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
    }
    catch (error) {
        console.error('Error answering expense notification:', error);
        res.status(500).json({ error: 'Failed to process expense response.' });
    }
});
exports.answerExpenseNotification = answerExpenseNotification;
//# sourceMappingURL=service.notification.js.map
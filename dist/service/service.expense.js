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
exports.createExpense = void 0;
const db_1 = require("../utils/db");
const StellarSdk = __importStar(require("stellar-sdk"));
const admin = __importStar(require("firebase-admin"));
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId, expenseId } = req.body;
        if (!eventId || !expenseId) {
            return res.status(400).json({ error: 'eventId, expenseId (transaction hash), and origin are required.' });
        }
        const eventRef = db_1.db.collection('events').doc(eventId);
        const expenseRef = db_1.db.collection('expenses').doc(expenseId);
        const notificationsRef = db_1.db.collection('notifications');
        const eventDoc = yield eventRef.get();
        if (!eventDoc.exists) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        const members = (_a = eventDoc.data()) === null || _a === void 0 ? void 0 : _a.members;
        const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
        function getTransactionData(expense) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const tx = yield server.transactions().transaction(expense).call();
                    // console.log("Transaction Data:", tx);
                    console.log(`Source Account: ${tx.source_account}`);
                    let amount;
                    const { records: operations } = yield tx.operations();
                    for (const op of operations) {
                        if (op.type === 'payment' && op.asset_type === 'native') {
                            amount = op.amount;
                        }
                    }
                    return [tx.source_account, amount];
                }
                catch (error) {
                    console.error("Error fetching transaction:", error);
                }
            });
        }
        let [origin, amount] = yield getTransactionData(expenseId);
        const batch = db_1.db.batch();
        batch.set(expenseRef, {
            amount: parseFloat(amount),
            event: eventId,
            nAccepted: 0,
            origin: origin,
        });
        members.forEach((memberPublicKey) => {
            if (memberPublicKey !== origin) {
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
        yield batch.commit();
        res.status(201).json({ message: 'Expense created and notifications sent successfully', expenseId: expenseId });
    }
    catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense.' });
    }
});
exports.createExpense = createExpense;
//# sourceMappingURL=service.expense.js.map
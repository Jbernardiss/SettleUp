"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionsRouter = (0, express_1.Router)();
transactionsRouter.post('/transfer', () => console.log('transferFunds')); // Transfer funds between users
//# sourceMappingURL=router.transactions.js.map
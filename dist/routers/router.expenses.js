"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_expense_1 = require("../service/service.expense");
const expensesRouter = (0, express_1.Router)();
// Canonical routes (mounted at /expenses)
expensesRouter.get("/:expenseId", service_expense_1.getExpenseById);
expensesRouter.post("/create", service_expense_1.createExpense);
exports.default = expensesRouter;
//# sourceMappingURL=router.expenses.js.map
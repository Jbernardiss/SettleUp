"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_expense_1 = require("../service/service.expense");
const expensesRouter = (0, express_1.Router)();
expensesRouter.get("/expenses/:expenseId", service_expense_1.getExpenseById);
expensesRouter.post("/expenses/create", service_expense_1.createExpense);
exports.default = expensesRouter;
//# sourceMappingURL=router.expenses.js.map
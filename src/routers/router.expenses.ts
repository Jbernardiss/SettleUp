import { Router } from "express";
import { 
  createExpense,
  getExpenseById
} from "../service/service.expense"; 

const expensesRouter = Router();

// Canonical routes (mounted at /expenses)
expensesRouter.get("/:expenseId", getExpenseById);

expensesRouter.post("/create", createExpense);

export default expensesRouter;

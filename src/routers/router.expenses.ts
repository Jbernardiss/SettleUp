import { Router } from "express";
import { 
  createExpense,
  getExpenseById
} from "../service/service.expense"; 

const expensesRouter = Router();

expensesRouter.get("/expenses/:expenseId", getExpenseById);

expensesRouter.post("/expenses/create", createExpense);

export default expensesRouter;

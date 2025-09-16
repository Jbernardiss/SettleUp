import { Router } from "express";
import { 
  createExpense
} from "../service/service.expense"; 

const expensesRouter = Router();

expensesRouter.get("/create_expense", createExpense)

export default expensesRouter;

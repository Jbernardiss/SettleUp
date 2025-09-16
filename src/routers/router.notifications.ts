import { Router } from "express";
import { 
  answerExpenseNotification,
  getNotificationsByUserId
} from "../service/service.notification"; 

const notificationsRouter = Router();

// Canonical routes (mounted at /notifications)
notificationsRouter.get("/:userId/get", getNotificationsByUserId)
notificationsRouter.get("/user/:userId", getNotificationsByUserId)

notificationsRouter.post("/answer_expense", answerExpenseNotification);

export default notificationsRouter;

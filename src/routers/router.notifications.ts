import { Router } from "express";
import { 
  answerEventNotification,
  answerExpenseNotification,
  getNotificationsByUserId
} from "../service/service.notification"; 

const notificationsRouter = Router();

notificationsRouter.get("/:userId/get_notifications", getNotificationsByUserId)

notificationsRouter.post("/:eventId/answer_event_notification", answerEventNotification)

notificationsRouter.post("/:eventId/answer_expense_notification", answerExpenseNotification);

export default notificationsRouter;

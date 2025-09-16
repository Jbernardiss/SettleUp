import { Router } from "express";
import { 
  answerEventNotification,
  answerExpenseNotification,
  getNotificationsByUserId
} from "../service/service.notification"; 

const notificationsRouter = Router();

notificationsRouter.get("/:userId/notifications/get", getNotificationsByUserId)

notificationsRouter.post("/:eventId/notifications/answer_event", answerEventNotification)

notificationsRouter.post("/:eventId/notifications/answer_expense", answerExpenseNotification);

export default notificationsRouter;

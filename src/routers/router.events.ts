import { Router } from "express";
import { 
  createEvent, 
  answerEventNotification, 
  answerExpenseNotification,
  finishEvent, 
  getEventById,
  getEventsByUserId,
} from "../service/service.event"; 

const eventsRouter = Router();

eventsRouter.get("/:eventId/get_event", getEventById)

eventsRouter.get("/:userId/get_user_events", getEventsByUserId)

eventsRouter.post("/events/create", createEvent);

eventsRouter.post("/:eventId/events/answer", answerEventNotification);

eventsRouter.post("/:expenseId/expenses/answer", answerExpenseNotification);

eventsRouter.post("/:eventId/finish", finishEvent);

export default eventsRouter;

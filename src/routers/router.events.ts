import { Router } from "express";
import { 
  createEvent, 
  addUserToEvent, 
  addExpenseToEvent,
  finishEvent, 
  getEventById,
  getEventsByUserId
} from "../service/service.event"; 

const eventsRouter = Router();

eventsRouter.get("/:eventId/get_event", getEventById)

eventsRouter.get("/:userId/get_user_events", getEventsByUserId)

eventsRouter.post("/create", createEvent);

eventsRouter.post("/:eventId/users/add", addUserToEvent);

eventsRouter.post("/:eventId/expenses/add", addExpenseToEvent);

eventsRouter.post("/:eventId/finish", finishEvent);

export default eventsRouter;

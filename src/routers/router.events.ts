import { Router } from "express";
import { 
  addUserToEvent,
  createEvent, 
  finishEvent, 
  getEventById,
  getEventsByUserId
} from "../service/service.event"; 

const eventsRouter = Router();

eventsRouter.get("/:eventId/get_event", getEventById)

eventsRouter.get("/:userId/get_user_events", getEventsByUserId)

eventsRouter.post("/events/create", createEvent);

eventsRouter.post("/:eventId/add_user", addUserToEvent)

eventsRouter.post("/:eventId/finish", finishEvent);

export default eventsRouter;

import { Router } from "express";
import { 
  addUserToEvent,
  createEvent, 
  finishEvent, 
  getEventById,
  getEventsByUserId
} from "../service/service.event"; 

const eventsRouter = Router();

// Backward-compatible route (used by frontend):
eventsRouter.get("/:eventId/get_event", getEventById)
// Canonical simpler route:
eventsRouter.get("/:eventId", getEventById)

// Backward-compatible route (used by frontend):
eventsRouter.get("/:userId/get_user_events", getEventsByUserId)
// Alternative canonical route:
eventsRouter.get("/user/:userId", getEventsByUserId)

// Fix duplicated segment (was /events/events/create when mounted):
eventsRouter.post("/create", createEvent);
// Also accept root POST for creation
eventsRouter.post("/", createEvent);

eventsRouter.post("/:eventId/add_user", addUserToEvent)

eventsRouter.post("/:eventId/finish", finishEvent);

export default eventsRouter;

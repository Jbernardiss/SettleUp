"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_event_1 = require("../service/service.event");
const eventsRouter = (0, express_1.Router)();
// Backward-compatible route (used by frontend):
eventsRouter.get("/:eventId/get_event", service_event_1.getEventById);
// Canonical simpler route:
eventsRouter.get("/:eventId", service_event_1.getEventById);
// Backward-compatible route (used by frontend):
eventsRouter.get("/:userId/get_user_events", service_event_1.getEventsByUserId);
// Alternative canonical route:
eventsRouter.get("/user/:userId", service_event_1.getEventsByUserId);
// Fix duplicated segment (was /events/events/create when mounted):
eventsRouter.post("/create", service_event_1.createEvent);
// Also accept root POST for creation
eventsRouter.post("/", service_event_1.createEvent);
eventsRouter.post("/:eventId/add_user", service_event_1.addUserToEvent);
eventsRouter.post("/:eventId/finish", service_event_1.finishEvent);
exports.default = eventsRouter;
//# sourceMappingURL=router.events.js.map
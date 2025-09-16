"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_event_1 = require("../service/service.event");
const eventsRouter = (0, express_1.Router)();
eventsRouter.get("/:eventId/get_event", service_event_1.getEventById);
eventsRouter.get("/:userId/get_user_events", service_event_1.getEventsByUserId);
eventsRouter.post("/events/create", service_event_1.createEvent);
eventsRouter.post("/:eventId/finish", service_event_1.finishEvent);
exports.default = eventsRouter;
//# sourceMappingURL=router.events.js.map
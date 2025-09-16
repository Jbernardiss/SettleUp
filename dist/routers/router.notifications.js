"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_notification_1 = require("../service/service.notification");
const notificationsRouter = (0, express_1.Router)();
notificationsRouter.get("/:userId/notifications/get", service_notification_1.getNotificationsByUserId);
notificationsRouter.post("/:eventId/notifications/answer_expense", service_notification_1.answerExpenseNotification);
exports.default = notificationsRouter;
//# sourceMappingURL=router.notifications.js.map
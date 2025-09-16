"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const service_notification_1 = require("../service/service.notification");
const notificationsRouter = (0, express_1.Router)();
// Canonical routes (mounted at /notifications)
notificationsRouter.get("/:userId/get", service_notification_1.getNotificationsByUserId);
notificationsRouter.get("/user/:userId", service_notification_1.getNotificationsByUserId);
notificationsRouter.post("/answer_expense", service_notification_1.answerExpenseNotification);
exports.default = notificationsRouter;
//# sourceMappingURL=router.notifications.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router_events_1 = __importDefault(require("./routers/router.events"));
const router_app_1 = __importDefault(require("./routers/router.app"));
const router_expenses_1 = __importDefault(require("./routers/router.expenses"));
const router_notifications_1 = __importDefault(require("./routers/router.notifications"));
const app = (0, express_1.Router)();
app.get('/hello', (req, res) => res.send('Sertaneca Compagode'));
app.use('/events', router_events_1.default);
app.use('/app', router_app_1.default);
app.use('/expenses', router_expenses_1.default);
app.use('/notifications', router_notifications_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
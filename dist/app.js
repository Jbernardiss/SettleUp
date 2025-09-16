"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router_events_1 = __importDefault(require("./routers/router.events"));
const app = (0, express_1.Router)();
app.use('/events', router_events_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = __importDefault(require("./app"));
const server = (0, express_1.default)();
// Parse JSON and URL-encoded bodies
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: true }));
// Lightweight CORS without dependency
server.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});
// Support both / and /api prefixes for API routes used by frontend
server.use('/api', app_1.default);
server.use('/', app_1.default);
exports.default = server;
//# sourceMappingURL=server.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const router_events_1 = __importDefault(require("./routers/router.events"));
const router_app_1 = __importDefault(require("./routers/router.app"));
const router_expenses_1 = __importDefault(require("./routers/router.expenses"));
const router_notifications_1 = __importDefault(require("./routers/router.notifications"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.Router)();
app.get('/hello', (req, res) => res.send('Sertaneca Compagode'));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../SettleUpFrontend/dist/assets')));
app.use('/events', router_events_1.default);
app.use('/expenses', router_expenses_1.default);
app.use('/notifications', router_notifications_1.default);
app.use('/', router_app_1.default);
app.use('/home', router_app_1.default);
app.use('/notificacoes', router_app_1.default);
app.use('/carteira', router_app_1.default);
app.use('/qrcode', router_app_1.default);
app.use('/invite-qr', router_app_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
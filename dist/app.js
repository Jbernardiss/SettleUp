"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app = (0, express_1.Router)();
app.get("/hello", (req, res) => {
    res.send("Hello from the router!");
});
exports.default = app;
//# sourceMappingURL=app.js.map


import express, { Router, type Express, type Request, type Response } from "express";

const app: Router = Router();

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello from the router!");
});

export default app;


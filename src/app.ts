
import express, { Router, type Express, type Request, type Response } from "express";
import eventsRouter from "./routers/router.events";

const app: Router = Router();

app.use('/events', eventsRouter);

export default app;


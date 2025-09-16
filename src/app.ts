
import express, { Router, type Express, type Request, type Response } from "express";
import eventsRouter from "./routers/router.events";
import appRouter from './routers/router.app'
import expensesRouter from "./routers/router.expenses";
import notificationsRouter from "./routers/router.notifications";

const app: Router = Router();

app.use('/events', eventsRouter);
app.use('/app', appRouter);
app.use('/expenses', expensesRouter);
app.use('/notifications', notificationsRouter);

export default app;


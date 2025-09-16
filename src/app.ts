
import express, { Router, type Express, type Request, type Response } from "express";
import eventsRouter from "./routers/router.events";
import appRouter from './routers/router.app'
import expensesRouter from "./routers/router.expenses";
import notificationsRouter from "./routers/router.notifications";
import path from "path";

const app: Router = Router();

app.use('/', appRouter);
app.get('/hello', (req, res) => res.send('Sertaneca Compagode'))
app.use('/assets', express.static(path.join(__dirname, '../SettleUpFrontend/dist/assets')));
app.use('/events', eventsRouter);
app.use('/expenses', expensesRouter);
app.use('/notifications', notificationsRouter);

export default app;



import express, { Router, type Express, type Request, type Response } from "express";
import eventsRouter from "./routers/router.events";
import appRouter from './routers/router.app'
import expensesRouter from "./routers/router.expenses";
import notificationsRouter from "./routers/router.notifications";
import path from "path";

const app: Router = Router();

app.get('/hello', (req, res) => res.send('Sertaneca Compagode'))
app.use('/assets', express.static(path.join(__dirname, '../SettleUpFrontend/dist/assets')));
app.use('/events', eventsRouter);
app.use('/expenses', expensesRouter);
app.use('/notifications', notificationsRouter);
app.use('/', appRouter)
app.use('/home', appRouter)
app.use('/notificacoes', appRouter)
app.use('/carteira', appRouter)
app.use('/qrcode', appRouter)
app.use('/invite-qr', appRouter)
app.use('/nft', appRouter)

// Single Page App fallback to index.html for unmatched GET routes
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const acceptsHtml = (req.headers['accept'] || '').toString().includes('text/html');
  if (!acceptsHtml) return next();
  const indexPath = path.join(__dirname, '../SettleUpFrontend/dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

export default app;


import express, { Express, Router } from "express";
import path from "path";

const appRouter = Router();

appRouter.get('/hello', (req, res) => res.send('asdfdasf'));
appRouter.use(express.static(path.join(__dirname, '../../SettleUpFrontend/dist'))); 

export default appRouter;
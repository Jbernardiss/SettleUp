import express, { Express, Router } from "express";
import path from "path";

const appRouter = Router();

appRouter.get('/hello', (req, res) => res.send('asdfdasf'));
appRouter.use(express.static(path.join(__dirname, '../../SettleUpFrontend/dist')));

appRouter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../SettleUpFrontend/distindex.html'));
});


export default appRouter;